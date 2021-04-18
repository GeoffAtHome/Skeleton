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
  USER_ID,
  UsersItem,
  UsersState,
  USER_DATA_LOADED,
  ADD_USER,
  UPDATE_USER,
  DELETE_USER,
  SELECT_USER,
} from '../actions/users';
import { RootAction, RootState } from '../store';

const INITIAL_STATE: UsersState = {
  _newUser: {
    displayName: '',
    email: '',
    photoURL: '',
    claims: { administrator: false, member: false, group: '' },
  },
  _index: '',
  _userData: [],
};

// eslint-disable-next-line no-empty-function
async function addToPouchDB(_newUser: UsersItem) {}

// eslint-disable-next-line no-empty-function
async function updatePouchDB(_newUser: UsersItem) {}

// eslint-disable-next-line no-empty-function
async function removePouchDB(_newUser: UsersItem) {}

const userData: Reducer<UsersState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case USER_ID:
      return {
        ...state,
      };

    case USER_DATA_LOADED: {
      const lUserData: Array<UsersItem> = [];
      const dataObject: object = action._data;

      if (dataObject !== null) {
        for (const [key, item] of Object.entries(dataObject)) {
          item.uid = key;
          lUserData.push(item);
        }
      }
      return {
        ...state,
        _userData: lUserData,
      };
    }

    case ADD_USER:
      addToPouchDB(action._newUser);
      return {
        ...state,
      };

    case UPDATE_USER:
      updatePouchDB(action._newUser);
      return {
        ...state,
      };

    case SELECT_USER:
      return {
        ...state,
        _newUser: action._newUser,
      };
    case DELETE_USER:
      removePouchDB(action._newUser);
      return {
        ...state,
      };

    default:
      return state;
  }
};

export default userData;

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

export const userDataSelector = (state: RootState) => state.userData;
