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
import { LatLng } from '../components/polygons';

export const LABEL_DATA_LOAD = 'LABEL_DATA_LOAD';
export const LABEL_DATA_LOADED = 'LABEL_DATA_LOADED';
export const GET_LABEL = 'GET_LABEL';
export const ADD_LABEL = 'ADD_LABEL';
export const UPDATE_LABEL = 'UPDATE_LABEL';
export const DELETE_LABEL = 'DELETE_LABEL';
export const MOVE_LABEL = 'MOVE_LABEL';
export const EDIT_LABEL = 'EDIT_LABEL';
export const LABEL_CHANGES = 'LABEL_CHANGES';
export const LABEL_DELETES = 'LABEL_DELETES';

export interface ILabel {
  text: string;
  latlng: LatLng;
  colour: string;
}

export interface LabelDataItem {
  _id: string;
  _rev?: any;
  labels: Array<ILabel>;
}

export interface LabelData {
  [index: string]: LabelDataItem;
}

export interface LabelDataState {
  _loadingStatus: string;
  _labels: Array<ILabel>;
  _newLabel: ILabel;
  _editLabel: number;
  _pc: string;
  _labelData: LabelData;
}

export interface LabelDataLoad extends Action<'LABEL_DATA_LOAD'> {
  _admin: boolean;
  _groupId: string;
}
export interface LabelDataLoaded extends Action<'LABEL_DATA_LOADED'> {
  _data: LabelData;
}
export interface LabelDataGetLabel extends Action<'GET_LABEL'> {
  _pc: string;
}
export interface LabelDataLabelsLoaded extends Action<'LABELS_LOADED'> {
  _labels: Array<ILabel>;
}
export interface LabelDataStreetAddLabel extends Action<'ADD_LABEL'> {
  _pc: string;
  _index: number;
  _newLabel: ILabel;
}
export interface LabelDataStreetUpdateLabel extends Action<'UPDATE_LABEL'> {
  _pc: string;
  _index: number;
  _newLabel: ILabel;
}
export interface LabelDataStreetDeleteLabel extends Action<'DELETE_LABEL'> {
  _pc: string;
  _index: number;
}
export interface LabelDataStreetMoveLabel extends Action<'MOVE_LABEL'> {
  _pc: string;
  _index: number;
  _latlng: LatLng;
}
export interface LabelDataStreetEditLabel extends Action<'EDIT_LABEL'> {
  _pc: string;
  _index: number;
}
export interface LabelChanges extends Action<'LABEL_CHANGES'> {
  _docs: LabelData;
}
export interface LabelDeletes extends Action<'LABEL_DELETES'> {
  _docs: LabelData;
}

export type LabelDataAction =
  | LabelDataLoad
  | LabelDataLoaded
  | LabelDataGetLabel
  | LabelDataLabelsLoaded
  | LabelDataStreetAddLabel
  | LabelDataStreetDeleteLabel
  | LabelDataStreetMoveLabel
  | LabelDataStreetEditLabel
  | LabelDataStreetUpdateLabel
  | LabelChanges
  | LabelDeletes;

export const labelDataLoad: ActionCreator<LabelDataLoad> = (
  _admin,
  _groupId
) => {
  return {
    type: LABEL_DATA_LOAD,
    _admin,
    _groupId,
  };
};

export const labelDataLoaded: ActionCreator<LabelDataLoaded> = _data => {
  return {
    type: LABEL_DATA_LOADED,
    _data,
  };
};

export const labelDataGetLabel: ActionCreator<LabelDataGetLabel> = (
  _pc,
  _index
) => {
  return {
    type: GET_LABEL,
    _pc,
  };
};

export const labelDataAddLabel: ActionCreator<LabelDataStreetAddLabel> = (
  _pc,
  _index,
  _newLabel
) => {
  return {
    type: ADD_LABEL,
    _pc,
    _index,
    _newLabel,
  };
};

export const labelDataUpdateLabel: ActionCreator<LabelDataStreetUpdateLabel> = (
  _pc,
  _index,
  _newLabel
) => {
  return {
    type: UPDATE_LABEL,
    _pc,
    _index,
    _newLabel,
  };
};

export const labelDataDeleteLabel: ActionCreator<LabelDataStreetDeleteLabel> = (
  _pc,
  _index
) => {
  return {
    type: DELETE_LABEL,
    _pc,
    _index,
  };
};

export const labelDataMoveLabel: ActionCreator<LabelDataStreetMoveLabel> = (
  _pc,
  _index,
  _latlng
) => {
  return {
    type: MOVE_LABEL,
    _pc,
    _index,
    _latlng,
  };
};

export const labelDataEditLabel: ActionCreator<LabelDataStreetEditLabel> = (
  _pc,
  _index
) => {
  return {
    type: EDIT_LABEL,
    _pc,
    _index,
  };
};

export const labelChanges: ActionCreator<LabelChanges> = _docs => {
  return {
    type: LABEL_CHANGES,
    _docs,
  };
};

export const labelDeletes: ActionCreator<LabelDeletes> = _docs => {
  return {
    type: LABEL_DELETES,
    _docs,
  };
};
