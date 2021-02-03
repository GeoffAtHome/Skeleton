// import PouchDB from 'pouchdb/dist/pouchdb.js';
// import * as PouchDB from 'pouchdb';
// import { store } from '../store';

import { ActionCreator } from 'redux';
import { store } from '../store';

function pouchDBError(error: any) {
  // eslint-disable-next-line no-console
  console.log(`DB Error:${error}`);
}
const remoteDBOptions: PouchDB.Configuration.RemoteDatabaseConfiguration = {
  skip_setup: true,
};

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
    await db.post(item);
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

function syncChange(
  changes: PouchDB.Replication.SyncResult<any>,
  changesCB: changeCallback,
  deletesCB: changeCallback
) {
  const changedDocs = changes.change.docs.filter(item => {
    return !('_deleted' in item);
  });
  const deletedDocs = changes.change.docs.filter(item => {
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

function syncPaused(localDB: string, x: any) {
  // eslint-disable-next-line no-console
  console.log(`${localDB} Paused: ${x}`);
}
function syncActive(localDB: string) {
  // eslint-disable-next-line no-console
  console.log(`${localDB} Active:`);
}
function syncDenied(localDB: string, x: any) {
  // eslint-disable-next-line no-console
  console.log(`${localDB} Denied: ${x}`);
}
function syncComplete(localDB: string, x: any) {
  // eslint-disable-next-line no-console
  console.log(`${localDB} Complete: ${x}`);
}
function syncError(localDB: string, x: any) {
  // eslint-disable-next-line no-console
  console.log(`${localDB} Error: ${x}`);
}

export function createPouchDB(
  dbName: string,
  rootURL: string,
  changes: changeCallback,
  deletes: changeCallback
): PouchDB.Database {
  // eslint-disable-next-line no-undef
  const localDB = new PouchDB(dbName);
  const remoteURL = rootURL + dbName;
  const options = { live: true, retry: true };
  localDB.replicate.from(remoteURL).on('complete', _info => {
    syncComplete(localDB.name, _info);
    localDB
      .sync(remoteURL, options)
      .on('change', info => syncChange(info, changes, deletes)) // handle change
      .on('paused', err => syncPaused(localDB.name, err)) // replication paused (e.g. replication up to date, user went offline)
      .on('active', () => syncActive(localDB.name)) // replicate resumed (e.g. new changes replicating, user went back online)
      .on('denied', err => syncDenied(localDB.name, err)) // a document failed to replicate (e.g. due to permissions)
      .on('complete', info => syncComplete(localDB.name, info)) // handle complete
      .on('error', err => syncError(localDB.name, err)); // handle error
  });

  return localDB;
}
