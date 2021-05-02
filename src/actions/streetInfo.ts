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

export const STREET_INFO_LOAD = 'STREET_INFO_LOAD';
export const STREET_INFO_LOADED = 'STREET_INFO_LOADED';
export const STREET_INFO_UPDATE = 'STREET_INFO_UPDATE';
export const STREET_INFO_CHANGES = 'STREET_INFO_CHANGES';
export const STREET_INFO_DELETES = 'STREET_INFO_DELETES';

export interface StreetInfoItem {
  _id: string;
  notes: string;
  firstHouse: number;
  lastHouse: number;
  streetOrder: string;
  numberOfProperties: number;
}

export interface StreetInfoData {
  [index: string]: StreetInfoItem;
}

export interface StreetInfoState {
  _streetInfo: StreetInfoData;
}

export interface StreetInfoLoad extends Action<'STREET_INFO_LOAD'> {}

export interface StreetInfoLoaded extends Action<'STREET_INFO_LOADED'> {
  _data: StreetInfoData;
}

export interface StreetInfoUpdate extends Action<'STREET_INFO_UPDATE'> {
  _updateItem: StreetInfoItem;
}

export interface StreetInfoChanges extends Action<'STREET_INFO_CHANGES'> {
  _docs: StreetInfoData;
}

export interface StreetInfoDeletes extends Action<'STREET_INFO_DELETES'> {
  _docs: StreetInfoData;
}

export type StreetInfoAction =
  | StreetInfoLoad
  | StreetInfoLoaded
  | StreetInfoUpdate
  | StreetInfoChanges
  | StreetInfoDeletes;

export const streetInfoLoad: ActionCreator<StreetInfoLoad> = () => {
  return {
    type: STREET_INFO_LOAD,
  };
};

export const streetInfoLoaded: ActionCreator<StreetInfoLoaded> = _data => {
  return {
    type: STREET_INFO_LOADED,
    _data,
  };
};

export const streetInfoUpdate: ActionCreator<StreetInfoUpdate> = _updateItem => {
  return {
    type: STREET_INFO_UPDATE,
    _updateItem,
  };
};

export const streetInfoChanges: ActionCreator<StreetInfoChanges> = _docs => {
  return {
    type: STREET_INFO_CHANGES,
    _docs,
  };
};

export const streetInfoDeletes: ActionCreator<StreetInfoDeletes> = _docs => {
  return {
    type: STREET_INFO_DELETES,
    _docs,
  };
};
