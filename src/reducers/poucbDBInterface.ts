// import PouchDB from 'pouchdb/dist/pouchdb';
import PouchDB from 'pouchdb';
// import { store } from '../store';

function pouchDBError(error: any) {
  // eslint-disable-next-line no-console
  console.log(`DB Error:${error}`);
}

export async function createDB(dbName: string): Promise<PouchDB.Database<{}>> {
  return new PouchDB(dbName);
}

/* export async function getData(db: PouchDB, dispatcher: function(data: any) none) {
  try {
    const data = await db.allDocs({ include_docs: true });
    store.dispatch(dispatcher(data));
  } catch (err) {
    pouchDBError(err);
  }
} */

export async function createItem(db: PouchDB.Database, item: any) {
  try {
    await db.post(item);
  } catch (err) {
    pouchDBError(err);
  }
}

export async function readItem(db: PouchDB.Database, id: any) {
  let item = {};
  try {
    item = await db.get(id);
    return item;
  } catch (err) {
    pouchDBError(err);
  }
  return item;
}

export async function updateItem(db: PouchDB.Database, item: any) {
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

export async function deleteItem(db: PouchDB.Database, item: any) {
  try {
    const revItem = await db.get(item._id);
    await db.remove(revItem._id, revItem._rev);
  } catch (err) {
    pouchDBError(err);
  }
}
