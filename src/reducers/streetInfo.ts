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
  createItemPouchDB,
  deleteItemPouchDB,
  loadPouchDB,
  RegisterSyncPouchDB,
  updateItemPouchDB,
} from './poucbDBInterface';

import { rootURL, streetInfoURL } from './dbconst';

import {
  STREET_INFO_LOAD,
  STREET_INFO_LOADED,
  STREET_INFO_UPDATE,
  StreetInfoState,
  streetInfoLoaded,
  streetInfoChanges,
  streetInfoDeletes,
  STREET_INFO_CHANGES,
  STREET_INFO_DELETES,
} from '../actions/streetInfo';
import { RootAction, RootState, store } from '../store';
import { UsersItem } from '../actions/users';

function streetInfoChangesDispatch(docs: any) {
  store.dispatch(streetInfoChanges(docs));
}

function streetInfoDeletedDispatch(docs: any) {
  store.dispatch(streetInfoDeletes(docs));
}

let streetInfoDB: PouchDB.Database;

const INITIAL_STATE: StreetInfoState = {
  _streetInfo: {},
};

// eslint-disable-next-line no-empty-function
async function addToPouchDB(_newUser: UsersItem) {}

// eslint-disable-next-line no-empty-function
async function updatePouchDB(_newUser: UsersItem) {}

// eslint-disable-next-line no-empty-function
async function removePouchDB(_newUser: UsersItem) {}

const streetInfoData: Reducer<StreetInfoState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case STREET_INFO_LOAD:
      streetInfoDB = RegisterSyncPouchDB(
        streetInfoURL,
        rootURL,
        streetInfoChangesDispatch,
        streetInfoDeletedDispatch
      );
      loadPouchDB(streetInfoDB, streetInfoLoaded);

      return {
        ...state,
      };

    case STREET_INFO_LOADED:
      return {
        ...state,
        _streetInfo: action._data,
      };

    case STREET_INFO_UPDATE: {
      const newList = { ...state._streetInfo };
      newList[action._updateItem._id] = action._updateItem;
      updateItemPouchDB(
        streetInfoDB,
        action._updateItem._id,
        action._updateItem
      );
      return {
        ...state,
        _groupData: newList,
      };
    }

    case STREET_INFO_CHANGES:
      return {
        ...state,
        _streetInfo: { ...state._streetInfo, ...action._docs },
      };

    case STREET_INFO_DELETES: {
      const newDeleteList = { ...state._streetInfo };
      Object.keys(action._docs).forEach(key => {
        delete newDeleteList[key];
      });
      return {
        ...state,
        _groupData: newDeleteList,
      };
    }

    default:
      return state;
  }
};

export default streetInfoData;

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

export const streetInfoDataSelector = (state: RootState) =>
  state.streetInfoData;
