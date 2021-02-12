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
  POSTBOX_ID,
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
const defaultPos = null;

const INITIAL_STATE: IPostBoxState = {
  _newPostbox: {
    pos: defaultPos,
    _id: '',
    _rev: '',
    description: {
      name: '',
      notes: '',
      address: '',
      openingTimes: '',
    },
  },
  _index: 0,
  _data: {},
  _mapCenter: defaultPos,
};

const postBoxState: Reducer<IPostBoxState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case POSTBOX_ID:
      return {
        ...state,
      };

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
        _index: 1,
        _newPostbox: action._newPostbox,
      };

    case CANCEL_EDIT_POSTBOX:
      return {
        ...state,
        _index: 0,
      };

    case ADD_POSTBOX: {
      const postBoxItem = action._newPostbox;
      const id = Date.now().toString();
      delete postBoxItem._rev;
      postBoxItem._id = id;
      createItemPouchDB(postboxDB, postBoxItem);
      return {
        ...state,
        _index: 0,
        _data: { ...state._data, ...{ id: postBoxItem } },
      };
    }

    case UPDATE_POSTBOX:
      updateItemPouchDB(postboxDB, action._newPostbox._id, action._newPostbox);

      return {
        ...state,
        _index: 0,
      };

    case DELETE_POSTBOX: {
      const newList = { ...state._data };
      delete newList[action._newPostbox._id];
      deleteItemPouchDB(postboxDB, action._newPostbox._id);

      return {
        ...state,
        _index: 0,
        _data: newList,
      };
    }

    case MOVE_MAP:
      return {
        ...state,
        _mapCenter: action._mapPos,
      };

    default:
      return state;
  }
};

export default postBoxState;

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

export const postboxSelector = (state: RootState) => state.postBoxState;
