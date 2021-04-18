/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { Action, ActionCreator } from 'redux';

export const USER_ID = 'USER_ID';
export const USER_DATA_LOADED = 'USER_DATA_LOADED';
export const ADD_USER = 'ADD_USER';
export const UPDATE_USER = 'UPDATE_USER';
export const DELETE_USER = 'DELETE_USER';
export const SELECT_USER = 'SELECT_USER';

/* name – identifier for the district
id – numeric number for the district
streets – array of streets the district is responsible for
rounds – array of rounds the district is responsible for
notes – notes about the district
contact_details – name, phone number, email address….. */

export interface UsersItem {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  claims: {
    administrator: boolean;
    member: boolean;
    group: string;
  };
}

export interface UsersState {
  _newUser: UsersItem;
  _index: string;
  _userData: Array<UsersItem>;
}

export interface UsersId extends Action<'USER_ID'> {
  _newUser: UsersItem;
  _index: string;
}
export interface UsersLoaded extends Action<'USER_DATA_LOADED'> {
  _data: Object;
}
export interface UsersAddUser extends Action<'ADD_USER'> {
  _newUser: UsersItem;
}
export interface UsersDeleteUser extends Action<'DELETE_USER'> {
  _newUser: UsersItem;
}
export interface UsersUpdateUser extends Action<'UPDATE_USER'> {
  _newUser: UsersItem;
}
export interface UsersSelectUser extends Action<'SELECT_USER'> {
  _newUser: UsersItem;
}

export type UsersAction =
  | UsersId
  | UsersLoaded
  | UsersAddUser
  | UsersDeleteUser
  | UsersUpdateUser
  | UsersSelectUser;

export const userDataState: ActionCreator<UsersId> = (_newUser, _index) => {
  return {
    type: USER_ID,
    _newUser,
    _index,
  };
};

export const userDataLoaded: ActionCreator<UsersLoaded> = _data => {
  return {
    type: USER_DATA_LOADED,
    _data,
  };
};

export const userDataAddUser: ActionCreator<UsersAddUser> = _newUser => {
  return {
    type: ADD_USER,
    _newUser,
  };
};

export const userDataDeleteUser: ActionCreator<UsersDeleteUser> = _newUser => {
  return {
    type: DELETE_USER,
    _newUser,
  };
};

export const userDataUpdateUser: ActionCreator<UsersUpdateUser> = _newUser => {
  return {
    type: UPDATE_USER,
    _newUser,
  };
};

export const userDataSelectUser: ActionCreator<UsersSelectUser> = _newUser => {
  return {
    type: SELECT_USER,
    _newUser,
  };
};
