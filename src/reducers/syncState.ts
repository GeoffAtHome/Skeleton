import { Reducer } from 'redux';

import {
  SYNC_STATE,
  ISyncState,
  syncChanges,
  syncDeletes,
} from '../actions/syncState';

import { RootAction, RootState, store } from '../store';
import { createPouchDB, ReSyncPouchDB, SyncPouchDB } from './poucbDBInterface';

function syncChangesDispatch(docs: any) {
  store.dispatch(syncChanges(docs));
  Object.keys(docs).forEach(db => {
    ReSyncPouchDB(db);
  });
}

function syncDeletedDispatch(docs: any) {
  store.dispatch(syncDeletes(docs));
}

// Setup database
const rootURL = 'https://scoutpostadmin.soord.org.uk:6984/';
const databaseName = 'syncchanges';
export const syncChangesDB = createPouchDB(databaseName);
const remoteDB = createPouchDB(rootURL + databaseName);

SyncPouchDB(syncChangesDB, remoteDB, syncChangesDispatch, syncDeletedDispatch);

const INITIAL_STATE: ISyncState = {
  _lastSyncState: '',
  _docs: {},
};

const syncState: Reducer<ISyncState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case SYNC_STATE:
      return {
        ...state,
        _lastSyncState: action._state,
      };

    default:
      return state;
  }
};

export default syncState;

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

export const syncStateSelector = (state: RootState) => state.syncState;