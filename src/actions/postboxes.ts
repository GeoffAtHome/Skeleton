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

export const POSTBOX_ID = 'POSTBOX_ID';
export const POSTBOX_DATA_LOAD = 'POSTBOX_DATA_LOAD';
export const POSTBOX_DATA_LOADED = 'POSTBOX_DATA_LOADED';
export const ADD_POSTBOX = 'ADD_POSTBOX';
export const UPDATE_POSTBOX = 'UPDATE_POSTBOX';
export const DELETE_POSTBOX = 'DELETE_POSTBOX';
export const EDIT_POSTBOX = 'EDIT_POSTBOX';
export const CANCEL_EDIT_POSTBOX = 'CANCEL_EDIT_POSTBOX';
export const MOVE_MAP = 'MOVE_MAP';
export const POSTBOX_CHANGES_TODO = 'POSTBOX_CHANGES_TODO';
export const POSTBOX_DELETES_TODO = 'POSTBOX_DELETES_TODO';

export interface IPostBox {
  name: string;
  openingTimes: string;
  notes: string;
  address: string;
}

export interface PostBoxData {
  _id: string;
  _rev?: string;
  pos: google.maps.LatLng | null;
  description: IPostBox;
}

export interface PostBoxList {
  [index: string]: PostBoxData;
}

export interface IPostBoxState {
  _newPostbox: PostBoxData;
  _index: number;
  _data: PostBoxList;
  _mapCenter: google.maps.LatLng | null;
}

export interface PostBoxId extends Action<'POSTBOX_ID'> {}
export interface PostBoxDataLoad extends Action<'POSTBOX_DATA_LOAD'> {}

export interface PostBoxDataLoaded extends Action<'POSTBOX_DATA_LOADED'> {
  _data: PostBoxList;
}
export interface PostBoxAdd extends Action<'ADD_POSTBOX'> {
  _newPostbox: PostBoxData;
}
export interface PostBoxUpdate extends Action<'UPDATE_POSTBOX'> {
  _newPostbox: PostBoxData;
}
export interface PostBoxDelete extends Action<'DELETE_POSTBOX'> {
  _newPostbox: PostBoxData;
}
export interface PostBoxEdit extends Action<'EDIT_POSTBOX'> {
  _newPostbox: PostBoxData;
}
export interface PostBoxCancelEdit extends Action<'CANCEL_EDIT_POSTBOX'> {}
export interface PostBoxMoveMap extends Action<'MOVE_MAP'> {
  _mapPos: google.maps.LatLng;
}

export interface PostBoxChanges extends Action<'POSTBOX_CHANGES_TODO'> {
  _docs: PostBoxList;
}

export interface PostBoxDeletes extends Action<'POSTBOX_DELETES_TODO'> {
  _docs: PostBoxList;
}

export type PostBoxAction =
  | PostBoxId
  | PostBoxAdd
  | PostBoxDelete
  | PostBoxEdit
  | PostBoxUpdate
  | PostBoxDataLoad
  | PostBoxDataLoaded
  | PostBoxCancelEdit
  | PostBoxMoveMap;

export const postBoxState: ActionCreator<PostBoxId> = (_newPostbox, _index) => {
  return {
    type: POSTBOX_ID,
    _newPostbox,
    _index,
  };
};

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

export const postBoxAdd: ActionCreator<PostBoxAdd> = _newPostbox => {
  return {
    type: ADD_POSTBOX,
    _newPostbox,
  };
};

export const postBoxUpdate: ActionCreator<PostBoxUpdate> = _newPostbox => {
  return {
    type: UPDATE_POSTBOX,
    _newPostbox,
  };
};

export const postBoxDelete: ActionCreator<PostBoxDelete> = _newPostbox => {
  return {
    type: DELETE_POSTBOX,
    _newPostbox,
  };
};

export const postBoxEdit: ActionCreator<PostBoxEdit> = _newPostbox => {
  return {
    type: EDIT_POSTBOX,
    _newPostbox,
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
    type: POSTBOX_CHANGES_TODO,
    _docs,
  };
};

export const postBoxDeletes: ActionCreator<PostBoxDeletes> = _docs => {
  return {
    type: POSTBOX_DELETES_TODO,
    _docs,
  };
};
