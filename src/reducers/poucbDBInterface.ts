// import PouchDB from 'pouchdb/dist/pouchdb.js';
import * as PouchDB from 'pouchdb';

import { ActionCreator } from 'redux';
import { store } from '../store';

// We are lazy loading its reducer.
import syncState, { syncStateSelector } from '../reducers/syncState';
import { syncStateChange } from '../actions/syncState';

if (syncStateSelector(store.getState()) === undefined) {
  store.addReducers({
    syncState,
  });
}

interface databaseRegister {
  name: string;
  localDB: PouchDB.Database;
  remoteDB: PouchDB.Database;
  changes: changeCallback;
  deletes: changeCallback;
  state: boolean;
  active: boolean;
  changed: boolean;
  syncHandler?: PouchDB.Replication.Sync<{}>;
}

const registeredDatabases: Array<databaseRegister> = [];

function getRegisteredDatabase(name: string) {
  const db = registeredDatabases.find(e => e.name === name);
  if (db) return db;

  throw new Error('Database not found');
}

function pouchDBError(error: any) {
  // eslint-disable-next-line no-console
  console.log(`DB Error:${error}`);
}
export interface DataList {
  [index: string]: any;
}

type changeCallback = (change: any) => void;

export async function loadPouchDB(
  db: PouchDB.Database,
  action: ActionCreator<any>
) {
  try {
    const data = await db.allDocs({ include_docs: true });
    const results: DataList = {};
    for (const _item of data.rows) {
      const item: any = _item.doc;
      results[item._id] = item;
    }
    store.dispatch(action(results));
  } catch (err) {
    pouchDBError(err);
  }
}

export async function createItemPouchDB(db: PouchDB.Database, item: any) {
  try {
    await db.put(item);
  } catch (err) {
    pouchDBError(err);
  }
}

export async function readItemPouchDB(db: PouchDB.Database, id: any) {
  let item = {};
  try {
    item = await db.get(id);
    return item;
  } catch (err) {
    pouchDBError(err);
  }
  return item;
}

export async function updateItemPouchDB(
  db: PouchDB.Database,
  id: string,
  item: any
) {
  try {
    const newItem = item;
    // Get revision
    const revItem = await db.get(id);
    newItem._rev = revItem._rev;
    newItem._id = id;
    await db.put(newItem);
  } catch (err) {
    pouchDBError(err);
  }
}

export async function deleteItemPouchDB(db: PouchDB.Database, id: string) {
  try {
    const revItem = await db.get(id);
    await db.remove(revItem._id, revItem._rev);
  } catch (err) {
    pouchDBError(err);
  }
}

async function syncChange(
  changes: PouchDB.Replication.SyncResult<any>,
  name: string
) {
  const db = getRegisteredDatabase(name);
  const changedDocs = changes.change.docs.filter((item: any) => {
    return !('_deleted' in item);
  });
  const deletedDocs = changes.change.docs.filter((item: any) => {
    return '_deleted' in item;
  });
  if (changedDocs.length) {
    const updates: DataList = {};
    for (const item of changedDocs) {
      const key = item._id;
      delete item._id;
      delete item._rev;

      updates[key] = item;
    }
    db.changes(updates);
  }

  if (deletedDocs.length) {
    const removes: DataList = {};
    for (const item of deletedDocs) {
      const key = item._id;
      delete item._id;
      delete item._rev;

      removes[key] = item;
    }
    db.deletes(removes);
  }
  db.changed = true;
}

/// -------------------------------------------------------------------------
export function CancelSyncPouchDB(name: string) {
  const db = getRegisteredDatabase(name);
  console.log(`CancelSyncPouchDB${name}`);

  if (db.state && db.active && db.changed) {
    db.state = false;
    db.active = false;
    db.changed = false;
    db.syncHandler!.cancel();
  }
}

function syncPausedCancel(localDB: PouchDB.Database) {
  store.dispatch(syncStateChange(`${localDB.name} sync complete`));
  // CancelSyncPouchDB(localDB.name);
}

function syncActive(localDB: string) {
  store.dispatch(syncStateChange(`${localDB} reconnected`));
  const db = getRegisteredDatabase(localDB);
  db.active = true;
}
function syncDenied(localDB: string, x: any) {
  store.dispatch(syncStateChange(`${localDB} denied ${x}`));
}
function syncComplete(localDB: string, x: any) {
  store.dispatch(syncStateChange(`${localDB} sync complete ${x}`));
}

function syncError(localDB: string, x: any) {
  store.dispatch(syncStateChange(`${localDB} Error: ${x}`));
}

export function createPouchDB(dbName: string): PouchDB.Database {
  // eslint-disable-next-line no-undef
  return new PouchDB(dbName);
}

function SyncOncePouchDB(
  localDB: PouchDB.Database,
  remoteDB: PouchDB.Database
) {
  const options = { live: true, retry: true };
  const syncHandler: PouchDB.Replication.Sync<{}> = localDB
    .sync(remoteDB, options)
    .on('change', (info: any) => syncChange(info, localDB.name)) // handle change
    .on('paused', () => syncPausedCancel(localDB)) // replication paused (e.g. replication up to date, user went offline)
    .on('active', () => syncActive(localDB.name)) // replicate resumed (e.g. new changes replicating, user went back online)
    .on('denied', (err: any) => syncDenied(localDB.name, err)) // a document failed to replicate (e.g. due to permissions)
    .on('complete', (info: any) => syncComplete(localDB.name, info)) // handle complete
    .on('error', (err: any) => syncError(localDB.name, err)); // handle error

  return syncHandler;
}

export function LoadPouchDB(
  localDB: PouchDB.Database,
  remoteDB: PouchDB.Database
) {
  localDB.replicate.from(remoteDB).on('complete', (_info: any) => {
    syncComplete(localDB.name, _info);
  });
}

export function ReSyncPouchDB(name: string) {
  const db = getRegisteredDatabase(name);
  console.log(`ResSyncPouchDB:${name}`);

  if (!db.state) {
    db.syncHandler = SyncOncePouchDB(db.localDB, db.remoteDB);
    db.state = true;
    db.changed = false;
    db.active = false;
  }
}

export function RegisterSyncPouchDB(
  name: string,
  rootURL: string,
  changes: changeCallback,
  deletes: changeCallback
) {
  const localDB = createPouchDB(name);
  const remoteDB = createPouchDB(rootURL + name);

  const db: databaseRegister = {
    name,
    localDB,
    remoteDB,
    changes,
    deletes,
    state: false,
    active: false,
    changed: false,
  };

  registeredDatabases.push(db);
  LoadPouchDB(localDB, remoteDB);
  ReSyncPouchDB(name);

  return localDB;
}

function syncSyncChange(
  changes: PouchDB.Replication.SyncResult<any>,
  changesCB: changeCallback,
  deletesCB: changeCallback
) {
  const changedDocs = changes.change.docs.filter((item: any) => {
    return !('_deleted' in item);
  });
  const deletedDocs = changes.change.docs.filter((item: any) => {
    return '_deleted' in item;
  });
  if (changedDocs.length) {
    const updates: DataList = {};
    for (const item of changes.change.docs) {
      const key = item._id;
      delete item._id;
      delete item._rev;

      updates[key] = item;
    }
    changesCB(updates);
  }

  if (deletedDocs.length) {
    const removes: DataList = {};
    for (const item of changes.change.docs) {
      const key = item._id;
      delete item._id;
      delete item._rev;

      removes[key] = item;
    }
    deletesCB(removes);
  }
}

function syncSyncPaused() {}

function syncSyncActive() {}
function syncSyncDenied() {}
function syncSyncComplete() {}
function syncSyncError() {}

export function SyncPouchDB(
  localDB: PouchDB.Database,
  remoteDB: PouchDB.Database,
  changes: changeCallback,
  deletes: changeCallback
) {
  const options = { live: true, retry: true };
  localDB.replicate.from(remoteDB).on('complete', (_info: any) => {
    syncSyncComplete();
    localDB
      .sync(remoteDB, options)
      .on('change', (info: any) => syncSyncChange(info, changes, deletes)) // handle change
      .on('paused', () => syncSyncPaused()) // replication paused (e.g. replication up to date, user went offline)
      .on('active', () => syncSyncActive()) // replicate resumed (e.g. new changes replicating, user went back online)
      .on('denied', () => syncSyncDenied()) // a document failed to replicate (e.g. due to permissions)
      .on('complete', () => syncSyncComplete()) // handle complete
      .on('error', () => syncSyncError()); // handle error
  });
}
