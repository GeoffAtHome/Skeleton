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
  ADD_SORTBOX,
  UPDATE_SORTBOX,
  DELETE_SORTBOX,
  SORTBOX_LOADED,
  SELECT_SORTBOX,
  SORTBOX_CHANGES,
  SORTBOX_DELETES,
  sortboxChanges,
  sortboxDeletes,
  SortboxState,
  sortboxLoaded,
  SORTBOX_LOAD,
} from '../actions/sortboxes';
import { RootAction, RootState, store } from '../store';
import { rootURL, sortBoxesURL } from './dbconst';

import {
  createItemPouchDB,
  databaseRegister,
  deleteItemPouchDB,
  loadPouchDB,
  RegisterSyncPouchDB,
  updateItemPouchDB,
} from './poucbDBInterface';

function sortboxChangesDispatch(docs: any) {
  store.dispatch(sortboxChanges(docs));
}

function sortboxDeletedDispatch(docs: any) {
  store.dispatch(sortboxDeletes(docs));
}

let sortboxDB: databaseRegister;

const INITIAL_STATE: SortboxState = {
  _newSortbox: {
    _id: '',
    name: '',
    notes: '',
    contactDetails: '',
    colour: '',
  },
  _index: '',
  _sortboxList: {},
};

const sortboxList: Reducer<SortboxState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case SORTBOX_LOAD:
      sortboxDB = RegisterSyncPouchDB(
        `${sortBoxesURL}${action._groupId}`,
        rootURL,
        sortboxChangesDispatch,
        sortboxDeletedDispatch
      );
      loadPouchDB(sortboxDB, sortboxLoaded);
      return {
        ...state,
      };

    case SORTBOX_LOADED:
      return {
        ...state,
        _sortboxList: action._data,
      };

    case SELECT_SORTBOX:
      return {
        ...state,
        _newSortbox: action._newSortbox,
      };

    case ADD_SORTBOX: {
      const newList = { ...state._sortboxList };
      createItemPouchDB(sortboxDB, action._newSortbox);
      newList[action._newSortbox._id] = action._newSortbox;
      return {
        ...state,
        _sortboxList: newList,
      };
    }

    case UPDATE_SORTBOX: {
      const newList = { ...state._sortboxList };
      newList[action._newSortbox._id] = action._newSortbox;
      updateItemPouchDB(sortboxDB, action._newSortbox._id, action._newSortbox);
      return {
        ...state,
        _groupData: newList,
      };
    }

    case DELETE_SORTBOX: {
      const newList = { ...state._sortboxList };
      delete newList[action._newSortbox._id];
      deleteItemPouchDB(sortboxDB, action._newSortbox._id);

      return {
        ...state,
        _groupData: newList,
      };
    }

    case SORTBOX_CHANGES:
      return {
        ...state,
        _sortboxList: { ...state._sortboxList, ...action._docs },
      };

    case SORTBOX_DELETES: {
      const newList = { ...state._sortboxList };
      Object.keys(action._docs).forEach(key => {
        delete newList[key];
      });
      return {
        ...state,
        _sortboxList: newList,
      };
    }

    default:
      return state;
  }
};

export default sortboxList;

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

export const sortboxListSelector = (state: RootState) => state.sortboxList;
