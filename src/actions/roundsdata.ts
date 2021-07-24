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

export const ROUND_DATA_LOAD = 'ROUND_DATA_LOAD';
export const ROUND_DATA_LOADED = 'ROUND_DATA_LOADED';
export const ROUND_DATA_UPDATE_ROUND = 'ROUND_DATA_UPDATE_ROUND';
export const ROUND_DATA_ROUND_UPDATED = 'ROUND_DATA_ROUND_UPDATED';
export const ADD_ROUND = 'ADD_ROUND';
export const UPDATE_ROUND = 'UPDATE_ROUND';
export const DELETE_ROUND = 'DELETE_ROUND';
export const SELECT_ROUND = 'SELECT_ROUND';
export const ROUND_DATA_CHANGES = 'ROUND_DATA_CHANGES';
export const ROUND_DATA_DELETES = 'ROUND_DATA_DELETES';

export interface RoundDataItem {
  _id: string;
  key: string;
  sortbox?: string;
}

export interface RoundData {
  [index: string]: RoundDataItem;
}

export interface RoundDataState {
  _roundData: RoundData;
}

export interface RoundDataLoad extends Action<'ROUND_DATA_LOAD'> {
  _admin: boolean;
  _groupId: string;
}
export interface RoundDataLoaded extends Action<'ROUND_DATA_LOADED'> {
  _data: RoundData;
}
export interface RoundDataUpdateRound
  extends Action<'ROUND_DATA_UPDATE_ROUND'> {
  _id: string;
  _groupKey: string;
  _oldGroupKey: string;
}
export interface RoundDataRoundUpdated
  extends Action<'ROUND_DATA_ROUND_UPDATED'> {
  _id: string;
  _groupKey: string;
}
export interface RoundDataAddGroup extends Action<'ADD_ROUND'> {
  _newGroup: RoundDataItem;
}
export interface RoundDataDeleteGroup extends Action<'DELETE_ROUND'> {
  _newGroup: RoundDataItem;
}
export interface RoundDataUpdateGroup extends Action<'UPDATE_ROUND'> {
  _newGroup: RoundDataItem;
}
export interface RoundDataSelectGroup extends Action<'SELECT_ROUND'> {
  _newGroup: RoundDataItem;
}
export interface RoundDataChanges extends Action<'ROUND_DATA_CHANGES'> {
  _docs: RoundData;
}
export interface RoundDataDeletes extends Action<'ROUND_DATA_DELETES'> {
  _docs: RoundData;
}

export type RoundDataAction =
  | RoundDataLoad
  | RoundDataLoaded
  | RoundDataAddGroup
  | RoundDataDeleteGroup
  | RoundDataUpdateGroup
  | RoundDataChanges
  | RoundDataDeletes
  | RoundDataSelectGroup
  | RoundDataUpdateRound
  | RoundDataRoundUpdated;

export const roundDataLoad: ActionCreator<RoundDataLoad> = (
  _admin,
  _groupId
) => {
  return {
    type: ROUND_DATA_LOAD,
    _admin,
    _groupId,
  };
};
export const roundDataLoaded: ActionCreator<RoundDataLoaded> = _data => {
  return {
    type: ROUND_DATA_LOADED,
    _data,
  };
};

export const roundDataUpdateRound: ActionCreator<RoundDataUpdateRound> = (
  _id: string,
  _groupKey: string,
  _oldGroupKey: string
) => {
  return {
    type: ROUND_DATA_UPDATE_ROUND,
    _id,
    _groupKey,
    _oldGroupKey,
  };
};

export const roundDataRoundUpdated: ActionCreator<RoundDataRoundUpdated> = (
  _id,
  _groupKey
) => {
  return {
    type: ROUND_DATA_ROUND_UPDATED,
    _id,
    _groupKey,
  };
};

export const roundDataAddGroup: ActionCreator<RoundDataAddGroup> = _newGroup => {
  return {
    type: ADD_ROUND,
    _newGroup,
  };
};

export const roundDataDeleteGroup: ActionCreator<RoundDataDeleteGroup> = _newGroup => {
  return {
    type: DELETE_ROUND,
    _newGroup,
  };
};

export const roundDataUpdateGroup: ActionCreator<RoundDataUpdateGroup> = _newGroup => {
  return {
    type: UPDATE_ROUND,
    _newGroup,
  };
};

export const roundDataSelectGroup: ActionCreator<RoundDataSelectGroup> = _newGroup => {
  return {
    type: SELECT_ROUND,
    _newGroup,
  };
};

export const roundDataChanges: ActionCreator<RoundDataChanges> = _docs => {
  return {
    type: ROUND_DATA_CHANGES,
    _docs,
  };
};

export const roundDataDeletes: ActionCreator<RoundDataDeletes> = _docs => {
  return {
    type: ROUND_DATA_DELETES,
    _docs,
  };
};
