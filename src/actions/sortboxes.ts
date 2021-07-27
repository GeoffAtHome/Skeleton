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

export const SORTBOX_LOAD = 'SORTBOX_LOAD';
export const SORTBOX_LOADED = 'SORTBOX_LOADED';
export const ADD_SORTBOX = 'ADD_SORTBOX';
export const UPDATE_SORTBOX = 'UPDATE_SORTBOX';
export const DELETE_SORTBOX = 'DELETE_SORTBOX';
export const SELECT_SORTBOX = 'SELECT_SORTBOX';
export const SORTBOX_CHANGES = 'SORTBOX_CHANGES';
export const SORTBOX_DELETES = 'SORTBOX_DELETES';

export interface SortboxItem {
  _id: string;
  name: string;
  notes: string;
  contactDetails: string;
  colour: string;
}

export interface SortboxList {
  [index: string]: SortboxItem;
}

export interface SortboxState {
  _loadingStatus: LoadingStatus;
  _newSortbox: SortboxItem;
  _index: string;
  _sortboxList: SortboxList;
}

export interface SortboxLoad extends Action<'SORTBOX_LOAD'> {
  _groupId: string;
}
export interface SortboxLoaded extends Action<'SORTBOX_LOADED'> {
  _data: SortboxList;
}
export interface SortboxDelete extends Action<'DELETE_SORTBOX'> {
  _newSortbox: SortboxItem;
}
export interface SortboxUpdate extends Action<'UPDATE_SORTBOX'> {
  _newSortbox: SortboxItem;
}
export interface SortboxAdd extends Action<'ADD_SORTBOX'> {
  _newSortbox: SortboxItem;
}
export interface SortboxSelect extends Action<'SELECT_SORTBOX'> {
  _newSortbox: SortboxItem;
}
export interface SortboxChanges extends Action<'SORTBOX_CHANGES'> {
  _docs: SortboxList;
}

export interface SortboxDeletes extends Action<'SORTBOX_DELETES'> {
  _docs: SortboxList;
}

export type SortboxAction =
  | SortboxChanges
  | SortboxDeletes
  | SortboxSelect
  | SortboxAdd
  | SortboxUpdate
  | SortboxDelete
  | SortboxLoad
  | SortboxLoaded;

export const sortboxLoad: ActionCreator<SortboxLoad> = _groupId => {
  return {
    type: SORTBOX_LOAD,
    _groupId,
  };
};

export const sortboxLoaded: ActionCreator<SortboxLoaded> = _data => {
  return {
    type: SORTBOX_LOADED,
    _data,
  };
};

export const sortboxAdd: ActionCreator<SortboxAdd> = _newSortbox => {
  return {
    type: ADD_SORTBOX,
    _newSortbox,
  };
};

export const sortboxDelete: ActionCreator<SortboxDelete> = _newSortbox => {
  return {
    type: DELETE_SORTBOX,
    _newSortbox,
  };
};

export const sortboxUpdate: ActionCreator<SortboxUpdate> = _newSortbox => {
  return {
    type: UPDATE_SORTBOX,
    _newSortbox,
  };
};

export const sortboxSelect: ActionCreator<SortboxSelect> = _newSortbox => {
  return {
    type: SELECT_SORTBOX,
    _newSortbox,
  };
};

export const sortboxChanges: ActionCreator<SortboxChanges> = _docs => {
  return {
    type: SORTBOX_CHANGES,
    _docs,
  };
};

export const sortboxDeletes: ActionCreator<SortboxDeletes> = _docs => {
  return {
    type: SORTBOX_DELETES,
    _docs,
  };
};
