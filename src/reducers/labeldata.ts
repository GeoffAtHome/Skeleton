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
import {
  createItemPouchDB,
  deleteItemPouchDB,
  readItemPouchDB,
  loadPouchDB,
  RegisterSyncPouchDB,
  updateItemPouchDB,
} from './poucbDBInterface';

import {
  GET_LABEL,
  ADD_LABEL,
  DELETE_LABEL,
  MOVE_LABEL,
  EDIT_LABEL,
  UPDATE_LABEL,
  LABELS_LOADED,
  LabelDataState,
  labelChanges,
  labelDeletes,
  LabelData,
  REGISTER_LABEL,
} from '../actions/labeldata';
import { RootAction, RootState, store } from '../store';
import { labelsURL, rootURL } from './dbconst';
import { LoadingStatus } from './PouchDBStatus';

function LabelChangesDispatch(docs: any) {
  store.dispatch(labelChanges(docs));
}

function LabelDeletedDispatch(docs: any) {
  store.dispatch(labelDeletes(docs));
}

let LabelDB: PouchDB.Database;

const INITIAL_STATE: LabelDataState = {
  _loadingStatus: LoadingStatus.Unknown,
  _label: [],
  _newLabel: {
    text: '',
    latlng: {
      lat: 51.50502153288204,
      lng: -3.240311294225257,
    },
    colour: '',
  },
  _editLabel: -1, // -1 is not editing otherwise Label index
  _index: '',
};

const labelData: Reducer<LabelDataState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case REGISTER_LABEL:
      LabelDB = RegisterSyncPouchDB(
        labelsURL,
        rootURL,
        LabelChangesDispatch,
        LabelDeletedDispatch
      );
      return {
        ...state,
        _loadingStatus: LoadingStatus.Loading,
      };

    case GET_LABEL:
      readItemPouchDB(LabelDB, action._index);
      return {
        ...state,
        _index: action._index,
        _loadingStatus: LoadingStatus.Loading,
      };

    case LABELS_LOADED:
      return {
        ...state,
        _label: action._labels,
        _loadingStatus: LoadingStatus.Loaded,
      };

    case EDIT_LABEL:
      return {
        ...state,
        _editLabel: action._index,
      };

    case ADD_LABEL: {
      if (state._label === undefined || state._label === null) {
        // eslint-disable-next-line no-param-reassign
        state._label = [];
      }

      const newLabel = state._label.slice(0);
      newLabel.push(action._newLabel);

      if (newLabel.length === 1) {
        const newLabelData: LabelData = {
          _id: state._index,
          labels: newLabel,
        };
        createItemPouchDB(LabelDB, newLabelData);
      } else {
        updateItemPouchDB(LabelDB, state._index, newLabel);
      }

      return {
        ...state,
        _label: newLabel,
        _editPath: false,
      };
    }

    case UPDATE_LABEL:
      if (state._label) {
        const newLabel = state._label.slice(0);
        newLabel[action._index] = action._newLabel;

        updateItemPouchDB(LabelDB, state._index, newLabel);

        return {
          ...state,
          _label: newLabel,
          _editPath: false,
          _editLabel: -1,
        };
      }
      return state;

    case MOVE_LABEL:
      if (state._label) {
        const newLabel = state._label.slice(0);
        newLabel[action._index].latlng = action._latlng;
        updateItemPouchDB(LabelDB, state._index, newLabel);

        return {
          ...state,
          _label: newLabel,
          _editPath: false,
          _editLabel: -1,
        };
      }
      return state;

    case DELETE_LABEL: {
      const newLabel = state._label.slice(0);
      const index = newLabel.indexOf(action._newLabel, 0);
      if (index > -1) {
        newLabel.splice(index, 1);
        deleteItemPouchDB(LabelDB, state._index);
      }

      return {
        ...state,
        _label: newLabel,
        _editPath: false,
        _editLabel: -1,
      };
    }

    default:
      return state;
  }
};

export default labelData;

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

export const labelDataSelector = (state: RootState) => state.labelData;
