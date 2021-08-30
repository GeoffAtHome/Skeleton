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
  groupDataChanges,
  groupDataDeletes,
  GROUP_DATA_LOAD,
  groupDataLoaded,
  GROUP_DATA_CHANGES,
  GROUP_DATA_DELETES,
} from '../actions/groupdata';
import { RootAction, RootState, store } from '../store';
import { rootURL, groupDataURL, groupsURL } from './dbconst';

import {
  createItemPouchDB,
  databaseRegister,
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

let groupDataDB: databaseRegister;

const INITIAL_STATE: GroupDataState = {
  _loadingStatus: '',
  _newGroup: {
    _id: '',
    name: '',
    notes: '',
    contactDetails: '',
    colour: '',
  },
  _index: '',
  _groupData: {},
};

const groupData: Reducer<GroupDataState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case GROUP_ID:
      return {
        ...state,
      };

    case GROUP_DATA_LOAD:
      if (action._admin) {
        groupDataDB = RegisterSyncPouchDB(
          groupDataURL,
          rootURL,
          groupDataChangesDispatch,
          groupDataDeletedDispatch
        );
      } else {
        groupDataDB = RegisterSyncPouchDB(
          `${groupsURL}${action._groupId}`,
          rootURL,
          groupDataChangesDispatch,
          groupDataDeletedDispatch
        );
      }
      loadPouchDB(groupDataDB, groupDataLoaded);
      return {
        ...state,
        _loadingStatus: groupDataDB.status,
      };

    case GROUP_DATA_LOADED:
      return {
        ...state,
        _groupData: action._data,
        _loadingStatus: groupDataDB.status,
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

export default groupData;

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

export const groupDataSelector = (state: RootState) => state.groupData;
