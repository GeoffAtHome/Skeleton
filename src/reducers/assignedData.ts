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
  ASSIGNED_DATA_LOADED,
  ASSIGNED_DATA_UPDATE_GROUP,
  ASSIGNED_DATA_GROUP_UPDATED,
  assignedDataChanges,
  assignedDataDeletes,
  assignedDataLoaded,
  ASSIGNED_DATA_CHANGES,
  ASSIGNED_DATA_DELETES,
  AssignedDataState,
  ASSIGNED_DATA_LOAD,
} from '../actions/assignedData';
import { RootAction, RootState, store } from '../store';
import { rootURL, groupDataURL, assignedDataURL } from './dbconst';

import {
  createItemPouchDB,
  deleteItemPouchDB,
  loadPouchDB,
  RegisterSyncPouchDB,
  updateItemPouchDB,
} from './poucbDBInterface';
import { LoadingStatus } from './PouchDBStatus';

function assignedDataChangesDispatch(docs: any) {
  store.dispatch(assignedDataChanges(docs));
}

function assignedDataDeletedDispatch(docs: any) {
  store.dispatch(assignedDataDeletes(docs));
}

let assignedDataDB: PouchDB.Database;

const INITIAL_STATE: AssignedDataState = {
  _loadingStatus: LoadingStatus.Unknown,
  _assignedData: {},
};

const assignedData: Reducer<AssignedDataState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case ASSIGNED_DATA_LOAD:
      assignedDataDB = RegisterSyncPouchDB(
        assignedDataURL,
        rootURL,
        assignedDataChangesDispatch,
        assignedDataDeletedDispatch
      );
      loadPouchDB(assignedDataDB, assignedDataLoaded);
      return {
        ...state,
        _loadingStatus: LoadingStatus.Loading,
      };

    case ASSIGNED_DATA_LOADED:
      return {
        ...state,
        _assignedData: action._data,
        _loadingStatus: LoadingStatus.Loaded,
      };

    case ASSIGNED_DATA_UPDATE_GROUP:
      updateItemPouchDB(assignedDataDB, action._id, action._groupKey);
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

    case ASSIGNED_DATA_CHANGES:
      return {
        ...state,
        _assignedData: { ...state._assignedData, ...action._docs },
      };

    case ASSIGNED_DATA_DELETES: {
      const newList = { ...state._assignedData };
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

export default assignedData;

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

export const assignedDataSelector = (state: RootState) => state.assignedData;
