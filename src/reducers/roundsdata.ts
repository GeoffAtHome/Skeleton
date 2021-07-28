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
  RoundDataState,
  ROUND_DATA_LOADED,
  ADD_ROUND,
  UPDATE_ROUND,
  DELETE_ROUND,
  SELECT_ROUND,
  ROUND_DATA_UPDATE_ROUND,
  ROUND_DATA_ROUND_UPDATED,
  roundDataChanges,
  roundDataDeletes,
  ROUND_DATA_LOAD,
  roundDataLoaded,
  ROUND_DATA_CHANGES,
  ROUND_DATA_DELETES,
} from '../actions/roundsdata';
import { RootAction, RootState, store } from '../store';
import { rootURL, roundsURL } from './dbconst';

import {
  createItemPouchDB,
  deleteItemPouchDB,
  loadPouchDB,
  RegisterSyncPouchDB,
  updateItemPouchDB,
} from './poucbDBInterface';
import { LoadingStatus } from './PouchDBStatus';

function roundDataChangesDispatch(docs: any) {
  store.dispatch(roundDataChanges(docs));
}

function roundDataDeletedDispatch(docs: any) {
  store.dispatch(roundDataDeletes(docs));
}

let roundDataDB: PouchDB.Database;

const INITIAL_STATE: RoundDataState = {
  _loadingStatus: LoadingStatus.Unknown,
  _roundData: {},
};

const roundData: Reducer<RoundDataState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case ROUND_DATA_LOAD:
      roundDataDB = RegisterSyncPouchDB(
        `${roundsURL}${action._groupId}`,
        rootURL,
        roundDataChangesDispatch,
        roundDataDeletedDispatch
      );
      loadPouchDB(roundDataDB, roundDataLoaded);
      return {
        ...state,
        _loadingStatus: LoadingStatus.Loading,
      };

    case ROUND_DATA_LOADED:
      return {
        ...state,
        _roundData: action._data,
        _loadingStatus: LoadingStatus.Loaded,
      };

    case ROUND_DATA_UPDATE_ROUND: {
      const updateList = { ...state._roundData };
      updateList[action._id] = { _id: action._id, key: action._groupKey };
      updateItemPouchDB(roundDataDB, action._id, { key: action._groupKey });
      return {
        ...state,
        _roundData: updateList,
      };
    }

    /* TODO: Should be in assigned?
    case ROUND_DATA_ROUND_UPDATED: {
      const x = state._assignedData[action._id];
      x.key = action._groupKey;
      const data = state._assignedData;
      data[action._id] = x;
      return {
        ...state,
        _assignedData: data,
      };
    } */

    case ADD_ROUND: {
      createItemPouchDB(roundDataDB, action._newGroup);
      const newList = { ...state._roundData };
      newList[action._newGroup._id] = action._newGroup;
      return {
        ...state,
        _roundData: newList,
      };
    }

    case UPDATE_ROUND: {
      const newList = { ...state._roundData };
      newList[action._newGroup._id] = action._newGroup;
      updateItemPouchDB(roundDataDB, action._newGroup._id, action._newGroup);
      return {
        ...state,
        _roundData: newList,
      };
    }

    case DELETE_ROUND: {
      const newList = { ...state._roundData };
      delete newList[action._newGroup._id];
      deleteItemPouchDB(roundDataDB, action._newGroup._id);

      return {
        ...state,
        _roundData: newList,
      };
    }

    case SELECT_ROUND:
      return {
        ...state,
        _newGroup: action._newGroup,
      };

    case ROUND_DATA_CHANGES:
      return {
        ...state,
        _roundData: { ...state._roundData, ...action._docs },
      };

    case ROUND_DATA_DELETES: {
      const newList = { ...state._roundData };
      Object.keys(action._docs).forEach(key => {
        delete newList[key];
      });
      return {
        ...state,
        _roundData: newList,
      };
    }

    default:
      return state;
  }
};

export default roundData;

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

export const roundDataSelector = (state: RootState) => state.roundData;
