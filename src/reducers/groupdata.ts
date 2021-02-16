/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { Reducer } from 'redux';
import {
  GROUP_ID,
  GroupDataState,
  GROUP_DATA_LOADED,
  ADD_GROUP,
  UPDATE_GROUP,
  DELETE_GROUP,
  SELECT_GROUP,
  ASSIGNED_DATA_LOADED,
  ASSIGNED_DATA_UPDATE_GROUP,
  ASSIGNED_DATA_GROUP_UPDATED,
  ROUND_DATA_UPDATE_ROUND,
  ADD_SORTBOX,
  UPDATE_SORTBOX,
  DELETE_SORTBOX,
  SORTBOX_DATA_LOADED,
  SELECT_SORTBOX,
  SORTBOX_DATA_UPDATE_SORTBOX,
  ROUND_DATA_ROUND_UPDATED,
  groupDataChanges,
  groupDataDeletes,
  GROUP_DATA_LOAD,
  groupDataLoaded,
  GROUP_DATA_CHANGES,
  GROUP_DATA_DELETES,
} from '../actions/groupdata';
import { RootAction, RootState, store } from '../store';
import { rootURL, groupDataURL } from './dbconst';

import {
  createItemPouchDB,
  deleteItemPouchDB,
  loadPouchDB,
  RegisterSyncPouchDB,
  updateItemPouchDB,
} from './poucbDBInterface';

function groupDataChangesDispatch(docs: any) {
  store.dispatch(groupDataChanges(docs));
}

function groupDataDeletedDispatch(docs: any) {
  store.dispatch(groupDataDeletes(docs));
}

const groupDataDB = RegisterSyncPouchDB(
  groupDataURL,
  rootURL,
  groupDataChangesDispatch,
  groupDataDeletedDispatch
);

const INITIAL_STATE: GroupDataState = {
  _newGroup: {
    _id: '',
    name: '',
    notes: '',
    contactDetails: '',
    colour: '',
  },
  _index: '',
  _groupData: {},
  _assignedData: {},
  _sortboxData: {},
};

const groupdata: Reducer<GroupDataState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case GROUP_ID:
      return {
        ...state,
      };

    case GROUP_DATA_LOAD:
      loadPouchDB(groupDataDB, groupDataLoaded);
      return {
        ...state,
      };

    case GROUP_DATA_LOADED:
      return {
        ...state,
        _groupData: action._data,
      };

    case SORTBOX_DATA_LOADED:
      return {
        ...state,
        _sortboxData: action._data,
      };

    case ASSIGNED_DATA_LOADED:
      return {
        ...state,
        _assignedData: action._data,
      };

    case ASSIGNED_DATA_UPDATE_GROUP:
      updateItemPouchDB(groupDataDB, action._id, action._groupKey);
      return {
        ...state,
      };

    case ASSIGNED_DATA_GROUP_UPDATED: {
      const x = state._assignedData[action._id];
      x.key = action._groupKey;
      const data = state._assignedData;
      data[action._id] = x;
      return {
        ...state,
        _assignedData: data,
      };
    }

    case ROUND_DATA_UPDATE_ROUND:
      updateItemPouchDB(groupDataDB, action._id, action._groupKey);
      return {
        ...state,
      };

    case ROUND_DATA_ROUND_UPDATED: {
      const x = state._assignedData[action._id];
      x.key = action._groupKey;
      const data = state._assignedData;
      data[action._id] = x;
      return {
        ...state,
        _assignedData: data,
      };
    }

    case SORTBOX_DATA_UPDATE_SORTBOX:
      updateItemPouchDB(groupDataDB, action._id, action._sortKey);
      return {
        ...state,
      };

    case ADD_GROUP: {
      createItemPouchDB(groupDataDB, action._newGroup);
      const newList = { ...state._groupData };
      newList[action._newGroup._id] = action._newGroup;
      return {
        ...state,
        _groupData: newList,
      };
    }

    case UPDATE_GROUP: {
      const newList = { ...state._groupData };
      newList[action._newGroup._id] = action._newGroup;
      updateItemPouchDB(groupDataDB, action._newGroup._id, action._newGroup);
      return {
        ...state,
        _groupData: newList,
      };
    }

    case DELETE_GROUP: {
      const newList = { ...state._groupData };
      delete newList[action._newGroup._id];
      deleteItemPouchDB(groupDataDB, action._newGroup._id);

      return {
        ...state,
        _groupData: newList,
      };
    }

    case SELECT_GROUP:
      return {
        ...state,
        _newGroup: action._newGroup,
      };

    case SELECT_SORTBOX:
      return {
        ...state,
        _newSortbox: action._newSortbox,
      };

    case ADD_SORTBOX: {
      const newList = { ...state._sortboxData };
      createItemPouchDB(groupDataDB, action._newSortbox);
      newList[action._newSortbox._id] = action._newSortbox;
      return {
        ...state,
        _sortboxData: newList,
      };
    }

    case UPDATE_SORTBOX: {
      const newList = { ...state._sortboxData };
      newList[action._newSortbox._id] = action._newSortbox;
      updateItemPouchDB(
        groupDataDB,
        action._newSortbox._id,
        action._newSortbox
      );
      return {
        ...state,
        _groupData: newList,
      };
    }

    case DELETE_SORTBOX: {
      const newList = { ...state._sortboxData };
      delete newList[action._newSortbox._id];
      deleteItemPouchDB(groupDataDB, action._newSortbox._id);

      return {
        ...state,
        _groupData: newList,
      };
    }

    case GROUP_DATA_CHANGES:
      return {
        ...state,
        _groupData: { ...state._groupData, ...action._docs },
      };

    case GROUP_DATA_DELETES: {
      const newList = { ...state._groupData };
      Object.keys(action._docs).forEach(key => {
        delete newList[key];
      });
      return {
        ...state,
        _groupData: newList,
      };
    }

    default:
      return state;
  }
};

export default groupdata;

// Per Redux best practices, the shop data in our store is structured
// for efficiency (small size and fast updates).
//
// The _selectors_ below transform store data into specific forms that
// are tailored for presentation. Putting this logic here keeps the
// layers of our app loosely coupled and easier to maintain, since
// views don't need to know about the store's internal data structures.
//
// We use a tiny library called `reselect` to create efficient
// selectors. More info: https://github.com/reduxjs/reselect.

export const groupdataSelector = (state: RootState) => state.groupdata;
