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
import { MapPolygon } from '../components/polygons';
import { LoadingStatus } from '../reducers/PouchDBStatus';

export const POLYGON_DATA_LOAD = 'POLYGON_DATA_LOAD';
export const POLYGON_DATA_LOADED = 'POLYGON_DATA_LOADED';
export const UPDATE_POLYGON = 'UPDATE_POLYGON';
export const POLYGON_UPDATED = 'POLYGON_UPDATED';
export const POLYGON_DATA_GET_POLYGON = 'POLYGON_DATA_GET_POLYGON';
export const POLYGON_DATA_CHANGED_POLYGON = 'POLYGON_DATA_CHANGED_POLYGON';
export const POLYGON_CHANGES = 'POLYGON_CHANGES';
export const POLYGON_DELETES = 'POLYGON_DELETES';

export interface PolygonDataItem {
  pos: [number, number];
  polygon: MapPolygon;
}

export interface CDBPolygonDataItem {
  _id: string;
  _rev: string;
  pos: [number, number];
  polygon: MapPolygon;
}

export interface PolygonData {
  [index: string]: PolygonDataItem;
}

export interface PolygonDataState {
  _loadingStatus: LoadingStatus;
  _index: string;
  _changedIndex: string;
  _pos: [number, number];
  _polygonData: PolygonData;
  _polygon: MapPolygon;
}

export interface PolygonDataLoad extends Action<'POLYGON_DATA_LOAD'> {
  _admin: boolean;
  _groupId: string;
}
export interface PolygonDataLoaded extends Action<'POLYGON_DATA_LOADED'> {
  _data: PolygonData;
}
export interface PolygonDataUpdatePolygon extends Action<'UPDATE_POLYGON'> {
  _pc: string;
  _polygon: MapPolygon;
}
export interface PolygonDataPolygonUpdated extends Action<'POLYGON_UPDATED'> {
  _pc: string;
  _pos: [number, number];
  _polygon: MapPolygon;
}
export interface PolygonDataGetPolygon
  extends Action<'POLYGON_DATA_GET_POLYGON'> {
  _pc: string;
}
export interface PolygonDataChangedPolygon
  extends Action<'POLYGON_DATA_CHANGED_POLYGON'> {
  _pc: string;
  _pos: [number, number];
  _polygon: MapPolygon;
}

export interface PolygonChanges extends Action<'POLYGON_CHANGES'> {
  _docs: PolygonData;
}
export interface PolygonDeletes extends Action<'POLYGON_DELETES'> {
  _docs: PolygonData;
}

export type PolygonDataAction =
  | PolygonDataLoad
  | PolygonDataLoaded
  | PolygonDataUpdatePolygon
  | PolygonDataPolygonUpdated
  | PolygonDataGetPolygon
  | PolygonDataChangedPolygon
  | PolygonChanges
  | PolygonDeletes;

export const polygonDataLoad: ActionCreator<PolygonDataLoad> = (
  _admin,
  _groupId
) => {
  return {
    type: POLYGON_DATA_LOAD,
    _admin,
    _groupId,
  };
};

export const polygonDataLoaded: ActionCreator<PolygonDataLoaded> = _data => {
  return {
    type: POLYGON_DATA_LOADED,
    _data,
  };
};

export const polygonDataUpdatePolygon: ActionCreator<PolygonDataUpdatePolygon> =
  (_pc, _polygon) => {
    return {
      type: UPDATE_POLYGON,
      _pc,
      _polygon,
    };
  };

export const polygonDataGetPolygon: ActionCreator<PolygonDataGetPolygon> =
  _pc => {
    return {
      type: POLYGON_DATA_GET_POLYGON,
      _pc,
    };
  };

export const polygonDataChangedPolygon: ActionCreator<PolygonDataChangedPolygon> =
  (_pc, _pos, _polygon) => {
    return {
      type: POLYGON_DATA_CHANGED_POLYGON,
      _pc,
      _pos,
      _polygon,
    };
  };

export const polygonChanges: ActionCreator<PolygonChanges> = _docs => {
  return {
    type: POLYGON_CHANGES,
    _docs,
  };
};

export const polygonDeletes: ActionCreator<PolygonDeletes> = _docs => {
  return {
    type: POLYGON_DELETES,
    _docs,
  };
};
