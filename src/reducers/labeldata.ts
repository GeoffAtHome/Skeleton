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
  databaseRegister,
} from './poucbDBInterface';

import {
  GET_LABEL,
  ADD_LABEL,
  DELETE_LABEL,
  MOVE_LABEL,
  EDIT_LABEL,
  UPDATE_LABEL,
  LabelDataState,
  labelChanges,
  labelDeletes,
  LabelData,
  LABEL_DATA_LOAD,
  LABEL_DATA_LOADED,
  labelDataLoaded,
  LabelDataItem,
} from '../actions/labeldata';
import { RootAction, RootState, store } from '../store';
import { labelsURL, rootURL } from './dbconst';

function LabelChangesDispatch(docs: any) {
  store.dispatch(labelChanges(docs));
}

function LabelDeletedDispatch(docs: any) {
  store.dispatch(labelDeletes(docs));
}

let LabelDB: databaseRegister;

const INITIAL_STATE: LabelDataState = {
  _loadingStatus: '',
  _editLabel: -1, // -1 is not editing otherwise Label index
  _pc: '',
  _labelData: {},
};

const labelData: Reducer<LabelDataState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case LABEL_DATA_LOAD:
      LabelDB = RegisterSyncPouchDB(
        labelsURL,
        rootURL,
        LabelChangesDispatch,
        LabelDeletedDispatch
      );
      loadPouchDB(LabelDB, labelDataLoaded);
      return {
        ...state,
        _loadingStatus: LabelDB.status,
      };

    case LABEL_DATA_LOADED:
      return {
        ...state,
        _labelData: action._data,
        _loadingStatus: LabelDB.status,
      };

    case GET_LABEL: {
      const thisLabelData =
        state._labelData[action._pc] === undefined
          ? { _id: action._pc, labels: [] }
          : state._labelData[action._pc];
      return {
        ...state,
        _pc: action._pc,
        _loadingStatus: LabelDB.status,
      };
    }

    case EDIT_LABEL:
      return {
        ...state,
        _editLabel: action._index,
        _pc: action._pc,
      };

    case ADD_LABEL: {
      const newLabelData = state._labelData;
      const newLabel = newLabelData[action._pc].labels;
      newLabel.push(action._newLabel);

      const newLabelItem: LabelDataItem = {
        _id: action._pc,
        labels: newLabel,
      };
      newLabelData[action._pc] = newLabelItem;

      if (newLabel.length === 1) {
        createItemPouchDB(LabelDB, newLabelItem);
      } else {
        updateItemPouchDB(LabelDB, action._pc, newLabelItem);
      }

      return {
        ...state,
        _labelData: newLabelData,
        _editPath: false,
      };
    }

    case UPDATE_LABEL:
      if (state._labelData[action._pc].labels) {
        const newLabelData = state._labelData;
        newLabelData[action._pc].labels[action._index] = action._newLabel;
        updateItemPouchDB(LabelDB, action._pc, newLabelData[action._pc]);

        return {
          ...state,
          _labelData: newLabelData,
          _editPath: false,
          _editLabel: -1,
        };
      }
      return state;

    case MOVE_LABEL:
      if (state._labelData[action._pc].labels) {
        const newLabelData = state._labelData;
        newLabelData[action._pc].labels[action._index].latlng = action._latlng;
        updateItemPouchDB(LabelDB, action._pc, newLabelData[action._pc]);

        return {
          ...state,
          _labelData: newLabelData,
          _editPath: false,
          _editLabel: -1,
        };
      }
      return state;

    case DELETE_LABEL: {
      const newLabelData = state._labelData;
      if (state._labelData[action._pc].labels.length <= 1) {
        delete newLabelData[action._pc];
        deleteItemPouchDB(LabelDB, action._pc);
        return {
          ...state,
          _labelData: newLabelData,
          _editPath: false,
          _editLabel: -1,
        };
      }
      const newLabel = state._labelData[action._pc];

      newLabel.labels.splice(action._index, 1);
      newLabelData[action._pc] = newLabel;
      updateItemPouchDB(LabelDB, action._pc, newLabel);
      return {
        ...state,
        _labelData: newLabelData,
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
