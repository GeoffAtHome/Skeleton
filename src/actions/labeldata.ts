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
import { LoadingStatus } from '../reducers/PouchDBStatus';

export const GET_LABEL = 'GET_LABEL';
export const LABELS_LOADED = 'LABELS_LOADED';
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

export interface LabelData {
  _id: string;
  _rev?: any;
  labels: Array<ILabel>;
}

export interface LabelDataState {
  _loadingStatus: LoadingStatus;
  _label: Array<ILabel>;
  _newLabel: ILabel;
  _editLabel: number;
  _index: string;
}

export interface LabelDataGetLabel extends Action<'GET_LABEL'> {
  _index: string;
}
export interface LabelDataLabelsLoaded extends Action<'LABELS_LOADED'> {
  _labels: Array<ILabel>;
}
export interface LabelDataStreetAddLabel extends Action<'ADD_LABEL'> {
  _newLabel: ILabel;
}
export interface LabelDataStreetUpdateLabel extends Action<'UPDATE_LABEL'> {
  _index: number;
  _newLabel: ILabel;
}
export interface LabelDataStreetDeleteLabel extends Action<'DELETE_LABEL'> {
  _newLabel: ILabel;
}
export interface LabelDataStreetMoveLabel extends Action<'MOVE_LABEL'> {
  _index: number;
  _latlng: LatLng;
}
export interface LabelDataStreetEditLabel extends Action<'EDIT_LABEL'> {
  _index: number;
}
export interface LabelChanges extends Action<'LABEL_CHANGES'> {
  _docs: LabelData;
}
export interface LabelDeletes extends Action<'LABEL_DELETES'> {
  _docs: LabelData;
}

export type LabelDataAction =
  | LabelDataGetLabel
  | LabelDataLabelsLoaded
  | LabelDataStreetAddLabel
  | LabelDataStreetDeleteLabel
  | LabelDataStreetMoveLabel
  | LabelDataStreetEditLabel
  | LabelDataStreetUpdateLabel
  | LabelChanges
  | LabelDeletes;

export const labelDataLabelsLoaded: ActionCreator<LabelDataLabelsLoaded> = _labels => {
  return {
    type: LABELS_LOADED,
    _labels,
  };
};

export const labelDataGetLabel: ActionCreator<LabelDataGetLabel> = _index => {
  return {
    type: GET_LABEL,
    _index,
  };
};

export const labelDataAddLabel: ActionCreator<LabelDataStreetAddLabel> = _newLabel => {
  return {
    type: ADD_LABEL,
    _newLabel,
  };
};

export const labelDataUpdateLabel: ActionCreator<LabelDataStreetUpdateLabel> = (
  _index,
  _newLabel
) => {
  return {
    type: UPDATE_LABEL,
    _index,
    _newLabel,
  };
};

export const labelDataDeleteLabel: ActionCreator<LabelDataStreetDeleteLabel> = _newLabel => {
  return {
    type: DELETE_LABEL,
    _newLabel,
  };
};

export const labelDataMoveLabel: ActionCreator<LabelDataStreetMoveLabel> = (
  _index,
  _latlng
) => {
  return {
    type: MOVE_LABEL,
    _index,
    _latlng,
  };
};

export const labelDataEditLabel: ActionCreator<LabelDataStreetEditLabel> = _index => {
  return {
    type: EDIT_LABEL,
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
