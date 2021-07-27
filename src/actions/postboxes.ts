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

export const POSTBOX_DATA_LOAD = 'POSTBOX_DATA_LOAD';
export const POSTBOX_DATA_LOADED = 'POSTBOX_DATA_LOADED';
export const ADD_POSTBOX = 'ADD_POSTBOX';
export const UPDATE_POSTBOX = 'UPDATE_POSTBOX';
export const DELETE_POSTBOX = 'DELETE_POSTBOX';
export const EDIT_POSTBOX = 'EDIT_POSTBOX';
export const CANCEL_EDIT_POSTBOX = 'CANCEL_EDIT_POSTBOX';
export const MOVE_MAP = 'MOVE_MAP';
export const POSTBOX_CHANGES = 'POSTBOX_CHANGES';
export const POSTBOX_DELETES = 'POSTBOX_DELETES';

export interface IPostBox {
  name: string;
  openingTimes: string;
  notes: string;
  address: string;
}

export interface PostBoxData {
  pos: google.maps.LatLngLiteral;
  description: IPostBox;
}

export interface PostBoxList {
  [index: string]: PostBoxData;
}

export interface IPostBoxState {
  _loadingStatus: LoadingStatus;
  _data: PostBoxList;
  _newPostbox: PostBoxData;
  _postBoxKey: string;
  _mapCenter: google.maps.LatLngLiteral;
}

export interface PostBoxDataLoad extends Action<'POSTBOX_DATA_LOAD'> {}

export interface PostBoxDataLoaded extends Action<'POSTBOX_DATA_LOADED'> {
  _data: PostBoxList;
}
export interface PostBoxAdd extends Action<'ADD_POSTBOX'> {
  _key: string;
  _newPostbox: PostBoxData;
}
export interface PostBoxUpdate extends Action<'UPDATE_POSTBOX'> {
  _key: string;
  _newPostbox: PostBoxData;
}
export interface PostBoxDelete extends Action<'DELETE_POSTBOX'> {
  _key: string;
  _newPostbox: PostBoxData;
}
export interface PostBoxEdit extends Action<'EDIT_POSTBOX'> {
  _postBoxKey: string;
}
export interface PostBoxCancelEdit extends Action<'CANCEL_EDIT_POSTBOX'> {}
export interface PostBoxMoveMap extends Action<'MOVE_MAP'> {
  _mapPos: google.maps.LatLngLiteral;
}
export interface PostBoxChanges extends Action<'POSTBOX_CHANGES'> {
  _docs: PostBoxList;
}

export interface PostBoxDeletes extends Action<'POSTBOX_DELETES'> {
  _docs: PostBoxList;
}

export type PostBoxAction =
  | PostBoxAdd
  | PostBoxDelete
  | PostBoxEdit
  | PostBoxUpdate
  | PostBoxDataLoad
  | PostBoxDataLoaded
  | PostBoxCancelEdit
  | PostBoxMoveMap
  | PostBoxChanges
  | PostBoxDeletes;

export const postBoxDataLoad: ActionCreator<PostBoxDataLoad> = () => {
  return {
    type: POSTBOX_DATA_LOAD,
  };
};

export const postBoxDataLoaded: ActionCreator<PostBoxDataLoaded> = _data => {
  return {
    type: POSTBOX_DATA_LOADED,
    _data,
  };
};

export const postBoxAdd: ActionCreator<PostBoxAdd> = (_key, _newPostbox) => {
  return {
    type: ADD_POSTBOX,
    _key,
    _newPostbox,
  };
};

export const postBoxUpdate: ActionCreator<PostBoxUpdate> = (
  _key,
  _newPostbox
) => {
  return {
    type: UPDATE_POSTBOX,
    _key,
    _newPostbox,
  };
};

export const postBoxDelete: ActionCreator<PostBoxDelete> = (
  _key,
  _newPostbox
) => {
  return {
    type: DELETE_POSTBOX,
    _key,
    _newPostbox,
  };
};

export const postBoxEdit: ActionCreator<PostBoxEdit> = _postBoxKey => {
  return {
    type: EDIT_POSTBOX,
    _postBoxKey,
  };
};

export const postBoxCancelEdit: ActionCreator<PostBoxCancelEdit> = _index => {
  return {
    type: CANCEL_EDIT_POSTBOX,
  };
};

export const postBoxMoveMap: ActionCreator<PostBoxMoveMap> = _mapPos => {
  return {
    type: MOVE_MAP,
    _mapPos,
  };
};

export const postBoxChanges: ActionCreator<PostBoxChanges> = _docs => {
  return {
    type: POSTBOX_CHANGES,
    _docs,
  };
};

export const postBoxDeletes: ActionCreator<PostBoxDeletes> = _docs => {
  return {
    type: POSTBOX_DELETES,
    _docs,
  };
};
