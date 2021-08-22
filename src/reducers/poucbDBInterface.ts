// import PouchDB from 'pouchdb/dist/pouchdb.js';
// import * as PouchDB from 'pouchdb';
// eslint-disable-next-line import/extensions
import { ActionCreator } from 'redux';
import { store } from '../store';
import 'pouchdb-authentication/dist/pouchdb.authentication';

// We are lazy loading its reducer.
import syncState, {
  syncChangesDB,
  syncStateSelector,
} from '../reducers/syncState';
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
let currentDB = 0;

function getCurrentDatabase() {
  if (registeredDatabases.length > 0) {
    return registeredDatabases[currentDB];
  }
  return undefined;
}
function getNextDatabase() {
  if (registeredDatabases.length > 0) {
    currentDB += 1;
    if (currentDB >= registeredDatabases.length) currentDB = 0;
    return getCurrentDatabase();
  }
  return undefined;
}

function getRegisteredDatabase(name: string) {
  const db = registeredDatabases.find(e => e.name === name);
  if (db) return db;

  throw new Error('Database not found');
}

function pouchDBError(db: PouchDB.Database, error: any) {
  // eslint-disable-next-line no-console
  console.log(`DB Error in ${db.name}:  ${error}`);
}
export interface DataList {
  [index: string]: any;
}

type changeCallback = (change: any) => void;

async function registerChange(db: PouchDB.Database) {
  try {
    const item: any = await syncChangesDB.get(db.name);
    item.value += 1;
    await syncChangesDB.put(item);
  } catch (err) {
    pouchDBError(db, err);
    try {
      await syncChangesDB.put({ _id: db.name, value: 0 });
    } catch (innerErr) {
      pouchDBError(db, innerErr);
    }
  }
}

export async function loadPouchDB(
  db: PouchDB.Database,
  action: ActionCreator<any>
) {
  try {
    const data = await db.allDocs({ include_docs: true });
    const results: DataList = {};
    for (const _item of data.rows) {
      const item: any = _item.doc;
      delete item._id;
      delete item._rev;

      results[_item.id] = item;
    }
    store.dispatch(action(results));
  } catch (err) {
    pouchDBError(db, err);
  }
}

export async function createItemPouchDB(db: PouchDB.Database, item: any) {
  try {
    if (!('_id' in item)) {
      // eslint-disable-next-line no-param-reassign
      item._id = Date.now().toString();
    }
    await db.put(item);
    await registerChange(db);
  } catch (err) {
    if (err.status === 409) {
      // eslint-disable-next-line no-use-before-define
      await updateItemPouchDB(db, item._id, item);
    } else pouchDBError(db, err);
  }
}

export async function readItemPouchDB(db: PouchDB.Database, id: any) {
  let item = {};
  try {
    item = await db.get(id);
    return item;
  } catch (err) {
    pouchDBError(db, err);
  }
  return item;
}

export async function updateItemPouchDB(
  db: PouchDB.Database,
  id: string,
  item: any
) {
  const newItem = item;
  newItem._id = id;
  try {
    // Get revision
    const revItem = await db.get(id);
    newItem._rev = revItem._rev;
    await db.put(newItem);
    await registerChange(db);
  } catch (err) {
    if (err.status === 404) {
      // Item does not exist so create a new one
      createItemPouchDB(db, newItem);
    } else {
      pouchDBError(db, err);
    }
  }
}

export async function deleteItemPouchDB(db: PouchDB.Database, id: string) {
  try {
    const revItem = await db.get(id);
    await db.remove(revItem._id, revItem._rev);
    await registerChange(db);
  } catch (err) {
    pouchDBError(db, err);
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
  await registerChange(db.localDB);
}

/// -------------------------------------------------------------------------
export function CancelSyncPouchDB(name: string) {
  const db = getRegisteredDatabase(name);
  if (db.state && db.active && db.changed) {
    db.state = false;
    db.active = false;
    db.changed = false;
    db.syncHandler!.cancel();
  }
}

function syncPausedCancel(localDB: PouchDB.Database) {
  store.dispatch(syncStateChange(`${localDB.name} sync complete`));
  CancelSyncPouchDB(localDB.name);
}

function syncActive(localDB: string) {
  store.dispatch(syncStateChange(`${localDB} reconnected`));
  const db = getRegisteredDatabase(localDB);
  db.active = true;
}
function syncDenied(localDB: string, x: any) {
  store.dispatch(syncStateChange(`${localDB} denied`));
}
function syncComplete(localDB: string, x: any) {
  store.dispatch(syncStateChange(`${localDB} sync complete`));
}

function syncError(localDB: string, x: any) {
  store.dispatch(syncStateChange(`${localDB} Error: ${x}`));
}

export function createPouchDB(dbName: string, options: any): PouchDB.Database {
  // eslint-disable-next-line no-undef
  return new PouchDB(dbName, options);
}

function SyncOncePouchDB(
  localDB: PouchDB.Database,
  remoteDB: PouchDB.Database
) {
  const options = { /* live: true, */ retry: true };
  const syncHandler: PouchDB.Replication.Sync<{}> = localDB
    .sync(remoteDB, options)
    .on('change', (info: any) => syncChange(info, localDB.name)) // handle change
    .on('paused', (err: any) => syncPausedCancel(localDB)) // replication paused (e.g. replication up to date, user went offline)
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
    syncPausedCancel(localDB);
  });
}

export function ReSyncPouchDB(name: string) {
  const db = getRegisteredDatabase(name);
  if (!db.state) {
    db.syncHandler = SyncOncePouchDB(db.localDB, db.remoteDB);
    db.state = true;
    db.changed = false;
    db.active = false;
  }
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

function syncSyncPaused(localDB: string, x: any) {}

function syncSyncActive(localDB: string) {}
function syncSyncDenied(localDB: string, x: any) {}
function syncSyncComplete(localDB: string, x: any) {}

function syncSyncError(localDB: string, x: any) {}

export function SyncPouchDB(
  localDB: PouchDB.Database,
  remoteDB: PouchDB.Database,
  changes: changeCallback,
  deletes: changeCallback
) {
  const options = { /* live: true, */ retry: true };
  localDB.replicate.from(remoteDB).on('complete', (_info: any) => {
    syncSyncComplete(localDB.name, _info);
    localDB
      .sync(remoteDB, options)
      .on('change', (info: any) => syncSyncChange(info, changes, deletes)) // handle change
      .on('paused', (err: any) => syncSyncPaused(localDB.name, err)) // replication paused (e.g. replication up to date, user went offline)
      .on('active', () => syncSyncActive(localDB.name)) // replicate resumed (e.g. new changes replicating, user went back online)
      .on('denied', (err: any) => syncSyncDenied(localDB.name, err)) // a document failed to replicate (e.g. due to permissions)
      .on('complete', (info: any) => syncSyncComplete(localDB.name, info)) // handle complete
      .on('error', (err: any) => syncSyncError(localDB.name, err)); // handle error
  });
}

export function syncNextDB() {
  const thisCurrentDB = getCurrentDatabase();
  if (thisCurrentDB !== undefined) {
    // Stop syncing current database
    const nextDB = getNextDatabase();

    // Start syncing next database
    if (nextDB !== undefined) {
      SyncOncePouchDB(nextDB?.localDB, nextDB?.remoteDB);
    }
  }
}

let poller = 0;

export function RegisterSyncPouchDB(
  name: string,
  rootURL: string,
  changes: changeCallback,
  deletes: changeCallback
) {
  try {
    const db = getRegisteredDatabase(name);
    return db.localDB;
  } catch (err) {
    const localDB = createPouchDB(name, {});
    const remoteDB = createPouchDB(rootURL + name, {});

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
    if (poller === 0) {
      // create the poller
      poller = 1;
      setInterval(syncNextDB, 500);
    }

    return localDB;
  }
}
