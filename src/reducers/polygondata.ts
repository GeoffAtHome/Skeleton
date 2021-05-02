/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { Reducer } from 'redux';
import { RootAction, RootState, store } from '../store';
import {
  POLYGON_DATA_LOADED,
  UPDATE_POLYGON,
  PolygonDataState,
  POLYGON_UPDATED,
  POLYGON_DATA_GET_POLYGON,
  POLYGON_DATA_CHANGED_POLYGON,
} from '../actions/polygondata';
import { updateItemPouchDB } from './poucbDBInterface';

function polygonChangesDispatch(docs: any) {
  store.dispatch(polygonChanges(docs));
}

function polygonDeletedDispatch(docs: any) {
  store.dispatch(polygonDeletes(docs));
}

let PolygonDB: PouchDB.Database;


const INITIAL_STATE: PolygonDataState = {
  _index: '',
  _changedIndex: '',
  _pos: [0, 0],
  _polygonData: {},
  _polygon: {
    type: 'Polygon',
    coordinates: [],
  },
};

const polygonData: Reducer<PolygonDataState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case POLYGON_DATA_LOADED:
      return {
        ...state,
        _polygonData: action._data,
      };

    case POLYGON_UPDATED:
      return {
        ...state,
        _index: action._pc,
        _pos: action._pos,
        _polygon: action._polygon,
      };

    case UPDATE_POLYGON:
      updateItemPouchDB(PolygonDB, state._index, action._polygon);
      state._polygonData[state._index].polygon = action._polygon;

      return {
        ...state,
        _polygon: action._polygon,
      };

    case POLYGON_DATA_GET_POLYGON: {
      const polygondata = state._polygonData[action._pc];
      return {
        ...state,
        _index: action._pc,
        _pos: polygondata.pos,
        _polygon: polygondata.polygon,
      };
    }

    case POLYGON_DATA_CHANGED_POLYGON:
      state._polygonData[action._pc].pos = action._pos;
      state._polygonData[action._pc].polygon = action._polygon;
      if (action._pc === state._index) {
        const lPolygonData = state._polygonData[action._pc];
        return {
          ...state,
          _changedIndex: action._pc,
          _pos: lPolygonData.pos,
          _polygon: lPolygonData.polygon,
        };
      }
      return {
        ...state,
        _changedIndex: action._pc,
      };

    default:
      return state;
  }
};

export default polygonData;

export const polygonDataSelector = (state: RootState) => state.polygonData;
