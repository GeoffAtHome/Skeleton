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
import { STREET_ID, EDIT_PATH, IStreetMapState, DISPLAY_DETAILS_DIALOG, UPDATE_STREET, CANCEL_DIALOGS, DATA_LOADED, ST_MOVE_MAP, STREETS_LOADED, STREETINFO_LOADED, StreetInfoData, streetMapChanges, streetMapDeletes, StreetMapDataLoaded } from '../actions/streetmap.js';
import { rootURL, streetInfoURL } from './dbconst';

import {
    createItemPouchDB,
    deleteItemPouchDB,
    loadPouchDB,
    RegisterSyncPouchDB,
    updateItemPouchDB,
  } from './poucbDBInterface';
  
  function streetMapChangesDispatch(docs: any) {
    store.dispatch(streetMapChanges(docs));
  }
  
  function streetMapDeletedDispatch(docs: any) {
    store.dispatch(streetMapDeletes(docs));
  }
  
  let streetMapDB: PouchDB.Database =
  RegisterSyncPouchDB(
    streetInfoURL,
    rootURL,
    streetMapChangesDispatch,
    streetMapDeletedDispatch
  );;
  
import { RootAction, RootState, store } from '../store.js';

const INITIAL_STATE: IStreetMapState = {
    _streetInfo: {},
    _streets: [],
    _editPath: false,
    _index: '',
    _displayDetailsDialog: false
};

const streetmap: Reducer<IStreetMapState, RootAction> = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case STREET_ID:
            return {
                ...state,
                _index: action._index
            };


        case DATA_LOADED:
            loadPouchDB(streetMapDB, StreetMapDataLoaded);

            return {
                ...state,
                _editPath: false
            }

        case STREETS_LOADED:
            return {
                ...state,
                _streets: action._streets
            };


        case STREETINFO_LOADED:
            return {
                ...state,
                _streetInfo: action._streetInfo
            };

        case EDIT_PATH:
            return {
                ...state,
                _editPath: !state._editPath
            };

        case ST_MOVE_MAP:
            return {
                ...state,
                _pos: [action._latlng.lat, action._latlng.lng]

            };

        case UPDATE_STREET:
            updateItemPouchDB(streetMapDB, action._key, action._item);
            const streetInfoData: StreetInfoData = state._streetInfo
            streetInfoData[action._key] = action._item
            return {
                ...state,
                _displayDetailsDialog: false,
                _streetInfo: streetInfoData
            }

        case DISPLAY_DETAILS_DIALOG:
            return {
                ...state,
                _displayDetailsDialog: true
            }

        case CANCEL_DIALOGS:
            return {
                ...state,
                _displayDetailsDialog: false
            }

        default:
            return state;
    }
};


export default streetmap;

// Per Redux best practices, the shop data in our store is structured
// for efficiency (small size and fast updates).
//
// The _selectors_ below transform store data into specific forms that
// are tailored for presentation. Putting this logic here keeps the
// layers of our app loosely coupled and easier to maintain, since
// views don't need to know about the store's internal data structures.
//
// We use a tiny library called `reselect` to create efficient
// selectors. More info: https://github.com/reduxjs/reselect.

export const streetMapSelector = (state: RootState) => state.streetmap;
