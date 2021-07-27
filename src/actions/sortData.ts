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
import { LoadingStatus } from '../reducers/PouchDBStatus';

export const SORTDATA_LOAD = 'SORTDATA_LOAD';
export const SORTDATA_LOADED = 'SORTDATA_LOADED';
export const ADD_SORTDATA = 'ADD_SORTDATA';
export const UPDATE_SORTDATA = 'UPDATE_SORTDATA';
export const DELETE_SORTDATA = 'DELETE_SORTDATA';
export const SELECT_SORTDATA = 'SELECT_SORTDATA';
export const SORTDATA_CHANGES = 'SORTDATA_CHANGES';
export const SORTDATA_DELETES = 'SORTDATA_DELETES';

export interface SortDataItem {
  _id: string;
  key: string;
  sortbox?: string;
}

export interface SortData {
  [index: string]: SortDataItem;
}

export interface SortDataState {
  _loadingStatus: LoadingStatus;
  _sortData: SortData;
}

export interface SortDataLoad extends Action<'SORTDATA_LOAD'> {
  _groupId: string;
}
export interface SortDataLoaded extends Action<'SORTDATA_LOADED'> {
  _data: SortData;
}
export interface SortDataDelete extends Action<'DELETE_SORTDATA'> {
  _newSortData: SortDataItem;
}
export interface SortDataUpdate extends Action<'UPDATE_SORTDATA'> {
  _newSortData: SortDataItem;
}
export interface SortDataAdd extends Action<'ADD_SORTDATA'> {
  _newSortData: SortDataItem;
}
export interface SortDataSelect extends Action<'SELECT_SORTDATA'> {
  _newSortData: SortDataItem;
}
export interface SortDataChanges extends Action<'SORTDATA_CHANGES'> {
  _docs: SortData;
}

export interface SortDataDeletes extends Action<'SORTDATA_DELETES'> {
  _docs: SortData;
}

export type SortDataAction =
  | SortDataChanges
  | SortDataDeletes
  | SortDataSelect
  | SortDataAdd
  | SortDataUpdate
  | SortDataDelete
  | SortDataLoad
  | SortDataLoaded;

export const sortDataLoad: ActionCreator<SortDataLoad> = _groupId => {
  return {
    type: SORTDATA_LOAD,
    _groupId,
  };
};

export const sortDataLoaded: ActionCreator<SortDataLoaded> = _data => {
  return {
    type: SORTDATA_LOADED,
    _data,
  };
};

export const sortDataAdd: ActionCreator<SortDataAdd> = _newSortData => {
  return {
    type: ADD_SORTDATA,
    _newSortData,
  };
};

export const sortDataDelete: ActionCreator<SortDataDelete> = _newSortData => {
  return {
    type: DELETE_SORTDATA,
    _newSortData,
  };
};

export const sortDataUpdate: ActionCreator<SortDataUpdate> = _newSortData => {
  return {
    type: UPDATE_SORTDATA,
    _newSortData,
  };
};

export const sortDataSelect: ActionCreator<SortDataSelect> = _newSortData => {
  return {
    type: SELECT_SORTDATA,
    _newSortData,
  };
};

export const sortDataChanges: ActionCreator<SortDataChanges> = _docs => {
  return {
    type: SORTDATA_CHANGES,
    _docs,
  };
};

export const sortDataDeletes: ActionCreator<SortDataDeletes> = _docs => {
  return {
    type: SORTDATA_DELETES,
    _docs,
  };
};
