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

export const ASSIGNED_DATA_LOAD = 'ASSIGNED_DATA_LOAD';
export const ASSIGNED_DATA_LOADED = 'ASSIGNED_DATA_LOADED';
export const ASSIGNED_DATA_UPDATE_GROUP = 'ASSIGNED_DATA_UPDATE_GROUP';
export const ASSIGNED_DATA_GROUP_UPDATED = 'ASSIGNED_DATA_GROUP_UPDATED';
export const ASSIGNED_DATA_CHANGES = 'ASSIGNED_DATA_CHANGES';
export const ASSIGNED_DATA_DELETES = 'ASSIGNED_DATA_DELETES';

export interface AssignedDataItem {
  _id: string;
  key: string;
  sortbox?: string;
}

export interface AssignedData {
  [index: string]: AssignedDataItem;
}

export interface AssignedDataState {
  _loadingStatus: string;
  _assignedData: AssignedData;
}
export interface AssignedDataLoad extends Action<'ASSIGNED_DATA_LOAD'> {}
export interface AssignedDataLoaded extends Action<'ASSIGNED_DATA_LOADED'> {
  _data: AssignedData;
}
export interface AssignedDataUpdateGroup
  extends Action<'ASSIGNED_DATA_UPDATE_GROUP'> {
  _id: string;
  _groupKey: string;
}
export interface AssignedDataGroupUpdated
  extends Action<'ASSIGNED_DATA_GROUP_UPDATED'> {
  _id: string;
  _groupKey: string;
}

export interface AssignedDataChanges extends Action<'ASSIGNED_DATA_CHANGES'> {
  _docs: AssignedData;
}

export interface AssignedDataDeletes extends Action<'ASSIGNED_DATA_DELETES'> {
  _docs: AssignedData;
}

export type AssignedDataAction =
  | AssignedDataChanges
  | AssignedDataDeletes
  | AssignedDataGroupUpdated
  | AssignedDataLoaded
  | AssignedDataLoad
  | AssignedDataUpdateGroup;

export const assignedDataLoad: ActionCreator<AssignedDataLoad> = () => {
  return {
    type: ASSIGNED_DATA_LOAD,
  };
};

export const assignedDataLoaded: ActionCreator<AssignedDataLoaded> = _data => {
  return {
    type: ASSIGNED_DATA_LOADED,
    _data,
  };
};

export const assignedDataUpdateGroup: ActionCreator<AssignedDataUpdateGroup> = (
  _id: string,
  _groupKey: string
) => {
  return {
    type: ASSIGNED_DATA_UPDATE_GROUP,
    _id,
    _groupKey,
  };
};

export const assignedDataGroupUpdated: ActionCreator<AssignedDataGroupUpdated> = (
  _id,
  _groupKey
) => {
  return {
    type: ASSIGNED_DATA_GROUP_UPDATED,
    _id,
    _groupKey,
  };
};

export const assignedDataChanges: ActionCreator<AssignedDataChanges> = _docs => {
  return {
    type: ASSIGNED_DATA_CHANGES,
    _docs,
  };
};

export const assignedDataDeletes: ActionCreator<AssignedDataDeletes> = _docs => {
  return {
    type: ASSIGNED_DATA_DELETES,
    _docs,
  };
};
