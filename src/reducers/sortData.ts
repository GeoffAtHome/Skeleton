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
  ADD_SORTDATA,
  UPDATE_SORTDATA,
  DELETE_SORTDATA,
  SORTDATA_LOADED,
  SELECT_SORTDATA,
  SORTDATA_CHANGES,
  SORTDATA_DELETES,
  sortDataChanges,
  sortDataDeletes,
  SortDataState,
  sortDataLoaded,
  SORTDATA_LOAD,
} from '../actions/sortData';
import { RootAction, RootState, store } from '../store';
import { rootURL, sortDataURL } from './dbconst';

import {
  createItemPouchDB,
  deleteItemPouchDB,
  loadPouchDB,
  RegisterSyncPouchDB,
  updateItemPouchDB,
} from './poucbDBInterface';
import { LoadingStatus } from './PouchDBStatus';

function sortDataChangesDispatch(docs: any) {
  store.dispatch(sortDataChanges(docs));
}

function sortDataDeletedDispatch(docs: any) {
  store.dispatch(sortDataDeletes(docs));
}

let sortDataDB: PouchDB.Database;

const INITIAL_STATE: SortDataState = {
  _loadingStatus: LoadingStatus.Unknown,
  _sortData: {},
};

const sortDataList: Reducer<SortDataState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case SORTDATA_LOAD:
      sortDataDB = RegisterSyncPouchDB(
        `${sortDataURL}${action._groupId}`,
        rootURL,
        sortDataChangesDispatch,
        sortDataDeletedDispatch
      );
      loadPouchDB(sortDataDB, sortDataLoaded);
      return {
        ...state,
        _loadingStatus: LoadingStatus.Loading,
      };

    case SORTDATA_LOADED:
      return {
        ...state,
        _sortData: action._data,
        _loadingStatus: LoadingStatus.Loaded,
      };

    case SELECT_SORTDATA:
      return {
        ...state,
        _newSortData: action._newSortData,
      };

    case ADD_SORTDATA: {
      const newList = { ...state._sortData };
      createItemPouchDB(sortDataDB, action._newSortData);
      newList[action._newSortData._id] = action._newSortData;
      return {
        ...state,
        _sortData: newList,
      };
    }

    case UPDATE_SORTDATA: {
      const newList = { ...state._sortData };
      newList[action._newSortData._id] = action._newSortData;
      updateItemPouchDB(
        sortDataDB,
        action._newSortData._id,
        action._newSortData
      );
      return {
        ...state,
        _groupData: newList,
      };
    }

    case DELETE_SORTDATA: {
      const newList = { ...state._sortData };
      delete newList[action._newSortData._id];
      deleteItemPouchDB(sortDataDB, action._newSortData._id);

      return {
        ...state,
        _groupData: newList,
      };
    }

    case SORTDATA_CHANGES:
      return {
        ...state,
        _sortData: { ...state._sortData, ...action._docs },
      };

    case SORTDATA_DELETES: {
      const newList = { ...state._sortData };
      Object.keys(action._docs).forEach(key => {
        delete newList[key];
      });
      return {
        ...state,
        _sortData: newList,
      };
    }

    default:
      return state;
  }
};

export default sortDataList;

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

export const sortDataSelector = (state: RootState) => state.sortData;
