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
  ADD_POSTBOX,
  DELETE_POSTBOX,
  EDIT_POSTBOX,
  CANCEL_EDIT_POSTBOX,
  UPDATE_POSTBOX,
  IPostBoxState,
  POSTBOX_DATA_LOADED,
  MOVE_MAP,
  postBoxChanges,
  postBoxDeletes,
  POSTBOX_DATA_LOAD,
  postBoxDataLoaded,
  POSTBOX_CHANGES,
  POSTBOX_DELETES,
} from '../actions/postboxes';
import { RootAction, RootState, store } from '../store';
import { rootURL, postboxURL } from './dbconst';
import {
  createItemPouchDB,
  deleteItemPouchDB,
  loadPouchDB,
  RegisterSyncPouchDB,
  updateItemPouchDB,
} from './poucbDBInterface';

function postboxChangesDispatch(docs: any) {
  store.dispatch(postBoxChanges(docs));
}

function postboxDeletedDispatch(docs: any) {
  store.dispatch(postBoxDeletes(docs));
}

const postboxDB = RegisterSyncPouchDB(
  postboxURL,
  rootURL,
  postboxChangesDispatch,
  postboxDeletedDispatch
);

// eslint-disable-next-line no-undef
const defaultPos = { lat: 51.50502153288204, lng: -3.240311294225257 };

const INITIAL_STATE: IPostBoxState = {
  _newPostbox: {
    pos: defaultPos,
    description: {
      name: '',
      notes: '',
      address: '',
      openingTimes: '',
    },
  },
  _postBoxKey: '',
  _data: {},
  _mapCenter: defaultPos,
};

const postBoxState: Reducer<IPostBoxState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case POSTBOX_DATA_LOAD:
      loadPouchDB(postboxDB, postBoxDataLoaded);
      return {
        ...state,
      };

    case POSTBOX_DATA_LOADED:
      return {
        ...state,
        _data: { ...action._data },
      };

    case EDIT_POSTBOX:
      return {
        ...state,
        _postBoxKey: action._postBoxKey,
      };

    case CANCEL_EDIT_POSTBOX:
      return {
        ...state,
        _postBoxKey: '',
      };

    case ADD_POSTBOX: {
      const newList = { ...state._data };
      const postBoxItem = action._newPostbox;
      newList[action._key] = postBoxItem;
      createItemPouchDB(postboxDB, postBoxItem);
      return {
        ...state,
        _postBoxKey: '',
        _data: { ...newList },
      };
    }

    case UPDATE_POSTBOX:
      updateItemPouchDB(postboxDB, action._key, action._newPostbox);

      return {
        ...state,
        _postBoxKey: '',
      };

    case DELETE_POSTBOX: {
      const newList = { ...state._data };
      delete newList[action._key];
      deleteItemPouchDB(postboxDB, action._key);

      return {
        ...state,
        _postBoxKey: '',
        _data: newList,
      };
    }

    case MOVE_MAP:
      return {
        ...state,
        _mapCenter: action._mapPos,
      };

    case POSTBOX_CHANGES:
      return {
        ...state,
        _data: { ...state._data, ...action._docs },
      };

    case POSTBOX_DELETES: {
      const newList = { ...state._data };
      Object.keys(action._docs).forEach(key => {
        delete newList[key];
      });
      return {
        ...state,
        _data: newList,
      };
    }

    default:
      return state;
  }
};

export default postBoxState;
export const postboxSelector = (state: RootState) => state.postBoxState;
