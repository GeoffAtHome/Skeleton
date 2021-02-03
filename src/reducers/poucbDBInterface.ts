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

export function createPouchDB(dbName: string): PouchDB.Database {
  return new PouchDB(dbName, remoteDBOptions);
}

/* export async function getData(db: PouchDB, dispatcher: function(data: any) none) {
  try {
    const data = await db.allDocs({ include_docs: true });
    store.dispatch(dispatcher(data));
  } catch (err) {
    pouchDBError(err);
  }
} */

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

export async function createItemPouchDB(
  db: PouchDB.Database,
  item: any,
  action: ActionCreator<any>
) {
  try {
    const savedItem = await db.post(item);
    store.dispatch(action(savedItem.id, item));
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

export async function updateItemPouchDB(db: PouchDB.Database, item: any) {
  try {
    // Get revision
    const revItem = await db.get(item._id);
    // eslint-disable-next-line no-param-reassign
    item._rev = revItem._rev;
    await db.put(item);
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
