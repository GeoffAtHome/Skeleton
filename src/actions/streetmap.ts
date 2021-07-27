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

export const STREET_ID = 'STREET_ID';
export const DATA_LOADED = 'DATA_LOADED';
export const STREETS_LOADED = 'STREETS_LOADED';
export const STREETINFO_LOADED = 'STREETINFO_LOADED';
export const ST_MOVE_MAP = 'ST_MOVE_MAP';
export const EDIT_PATH = 'EDIT_PATH';
export const DISPLAY_DETAILS_DIALOG = 'DISPLAY_DETAILS_DIALOG';
export const UPDATE_STREET = 'UPDATE_STREET';
export const CANCEL_DIALOGS = 'CANCEL_DIALOGS';
export const EDIT_LABEL = 'EDIT_LABEL';
export const STREET_MAP_CHANGES = 'STREET_MAP_CHANGES';
export const STREET_MAP_DELETES = 'STREET_MAP_DELETES';

/* streetName – name of the street
postcode - postcode for the street (Note some streets have multiple postcodes. These streets should be split by postcode).
index – uuid
polygon – coordinates to draw polygon around street on the map
labels – array of labels to draw on the map. Each label has:
text – description
latlng – latitude longitude for drawing label on the map
colour – to use when drawing the label
pos – latitude longitude for the centre of the street.
street_order – The layout of the street in terms of house numbers/name. It can be one of the following:
    Sequential – the houses are in sequential order
    Odd/Even – odd houses on one side of the street and even on the other
    Even only – street only has even numbered houses
    Odd only – street only has odd numbered houses
    Names only – street only has house names
    unknown – street order is unknown
district_sort_box – identifier for district sort box
local_sort_box – identifier for local sort box */

export interface IStreetMapState {
  _loadingStatus: LoadingStatus;
  _streetInfo: StreetInfoData;
  _streets: Array<string>;
  _editPath: boolean;
  _index: string;
  _displayDetailsDialog: boolean;
}

export interface StreetInfoItem {
  firstHouse: string;
  lastHouse: string;
  notes: string;
  streetOrder: string;
  numberOfProperties: number;
}
export interface StreetInfoData {
  [index: string]: StreetInfoItem;
}

export interface PostcodeData {
  name: string;
  _id: string;
  firstHouse?: string;
  lastHouse?: string;
  notes?: string;
  numberOfProperties?: number;
  streetOrder?: string;
  districtSortBox?: string;
  localSortBox?: string;
  dsb?: string;
  lsb?: string;
}

export interface StreetMapStreetId extends Action<'STREET_ID'> {
  _index: string;
}
export interface StreetMapDataLoaded extends Action<'DATA_LOADED'> {
  _data: IStreetMapState;
}
export interface StreetMapStreetsLoaded extends Action<'STREETS_LOADED'> {
  _streets: Array<string>;
}
export interface StreetMapStreetInfoLoaded extends Action<'STREETINFO_LOADED'> {
  _streetInfo: StreetInfoData;
}
export interface StreetMapStreetMoveMap extends Action<'ST_MOVE_MAP'> {
  _latlng: google.maps.LatLngLiteral;
}
export interface StreetMapStreetEditPath extends Action<'EDIT_PATH'> {}
export interface StreetMapStreetDisplayDetailsDialog
  extends Action<'DISPLAY_DETAILS_DIALOG'> {}
export interface StreetMapStreetUpdateStreetItem
  extends Action<'UPDATE_STREET'> {
  _key: string;
  _item: StreetInfoItem;
}
export interface StreetMapStreetCancelDialogs
  extends Action<'CANCEL_DIALOGS'> {}
export interface StreetMapStreetEditLabel extends Action<'EDIT_LABEL'> {
  _index: number;
}
export interface StreetMapChanges extends Action<'STREET_MAP_CHANGES'> {
  _docs: StreetInfoItem;
}
export interface StreetMapDeletes extends Action<'STREET_MAP_DELETES'> {
  _docs: StreetInfoItem;
}

export type StreetMapAction =
  | StreetMapDeletes
  | StreetMapChanges
  | StreetMapStreetId
  | StreetMapStreetInfoLoaded
  | StreetMapDataLoaded
  | StreetMapStreetEditPath
  | StreetMapStreetUpdateStreetItem
  | StreetMapStreetCancelDialogs
  | StreetMapStreetMoveMap
  | StreetMapStreetsLoaded
  | StreetMapStreetDisplayDetailsDialog
  | StreetMapStreetEditLabel;

export const StreetMapGetPolygon: ActionCreator<StreetMapStreetId> = _index => {
  return {
    type: STREET_ID,
    _index,
  };
};

export const StreetMapDataLoaded: ActionCreator<StreetMapDataLoaded> = _data => {
  return {
    type: DATA_LOADED,
    _data,
  };
};

export const StreetMapStreetsLoaded: ActionCreator<StreetMapStreetsLoaded> = _streets => {
  return {
    type: STREETS_LOADED,
    _streets,
  };
};

export const StreetMapStreetInfoLoaded: ActionCreator<StreetMapStreetInfoLoaded> = _streetInfo => {
  return {
    type: STREETINFO_LOADED,
    _streetInfo,
  };
};

export const streetMapMoveMap: ActionCreator<StreetMapStreetMoveMap> = _latlng => {
  return {
    type: ST_MOVE_MAP,
    _latlng,
  };
};

export const streetMapEditPath: ActionCreator<StreetMapStreetEditPath> = () => {
  return {
    type: EDIT_PATH,
  };
};

export const streetMapDisplayDetailsDialog: ActionCreator<StreetMapStreetDisplayDetailsDialog> = _index => {
  return {
    type: DISPLAY_DETAILS_DIALOG,
  };
};

export const streetMapUpdateStreetItem: ActionCreator<StreetMapStreetUpdateStreetItem> = (
  _key,
  _item
) => {
  return {
    type: UPDATE_STREET,
    _key,
    _item,
  };
};

export const streetMapCancelDialogs: ActionCreator<StreetMapStreetCancelDialogs> = () => {
  return {
    type: CANCEL_DIALOGS,
  };
};

export const streetMapEditLabel: ActionCreator<StreetMapStreetEditLabel> = _index => {
  return {
    type: EDIT_LABEL,
    _index,
  };
};

export const streetMapChanges: ActionCreator<StreetMapChanges> = _docs => {
  return {
    type: STREET_MAP_CHANGES,
    _docs,
  };
};

export const streetMapDeletes: ActionCreator<StreetMapDeletes> = _docs => {
  return {
    type: STREET_MAP_DELETES,
    _docs,
  };
};
