// import PouchDB from 'pouchdb/dist/pouchdb.js';
// import * as PouchDB from 'pouchdb';
// import { store } from '../store';

import { ActionCreator } from 'redux';
import {
  RealtimeSubscription,
  SupabaseClient,
  SupabaseRealtimePayload,
} from '@supabase/supabase-js';
import { SupabaseQueryBuilder } from '@supabase/supabase-js/dist/main/lib/SupabaseQueryBuilder';
import { store } from '../store';
import { getSpDB } from '../components/supa-base';

// We are lazy loading its reducer.
import syncState, { syncStateSelector } from '../reducers/syncState';
import { syncStateChange } from '../actions/syncState';

if (syncStateSelector(store.getState()) === undefined) {
  store.addReducers({
    syncState,
  });
}

export interface databaseRegister {
  name: string;
  remoteDB: SupabaseClient;
  subscription: RealtimeSubscription;
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
  db: databaseRegister,
  action: ActionCreator<any>
) {
  try {
    const { data, error } = await db.remoteDB.from(db.name).select('*');
    const results: DataList = {};
    if (data !== null) {
      for (const _item of data) {
        const { id } = _item;
        delete _item.id;
        results[id] = _item;
      }
    }
    store.dispatch(action(results));
  } catch (error) {
    pouchDBError(error);
  }
}

export async function createItemPouchDB(
  db: databaseRegister,
  id: string,
  item: any
) {
  try {
    const { data, error } = await db.remoteDB
      .from(db.name)
      .insert([{ ...item, ...{ id } }]);
  } catch (err) {
    pouchDBError(err);
  }
}

export async function readItemPouchDB(db: databaseRegister, id: any) {
  const item: IDataList = {};
  try {
    const { data, error } = await db.remoteDB.from(db.name).select(id);
    if (data !== null) item[id] = data;
  } catch (err) {
    pouchDBError(err);
  }
  return item;
}

export async function updateItemPouchDB(
  db: databaseRegister,
  id: string,
  item: any
) {
  try {
    const { data, error } = await db.remoteDB
      .from(db.name)
      .update({ ...item, ...{ id } })
      .match({ id });
  } catch (err) {
    pouchDBError(err);
  }
}

export async function deleteItemPouchDB(db: databaseRegister, id: string) {
  try {
    const { data, error } = await db.remoteDB
      .from(db.name)
      .delete()
      .match({ id });
  } catch (err) {
    pouchDBError(err);
  }
}

interface IDataList {
  [index: string]: any;
}

function doChanges(
  payload: SupabaseRealtimePayload<any>,
  changes: changeCallback
) {
  const _item = payload.eventType === 'DELETE' ? payload.old : payload.new;
  const _id: string = _item.id;
  const item: IDataList = {};
  delete _item.id;
  item[_id] = _item;

  changes(item);
}

export function RegisterSyncPouchDB(
  name: string,
  changes: changeCallback,
  deletes: changeCallback
) {
  const remoteDB = getSpDB();
  const subscription = remoteDB
    .from(name)
    .on('INSERT', async (payload: SupabaseRealtimePayload<any>) => {
      console.log('INSERT');
      doChanges(payload, changes);
    })
    .on('UPDATE', async (payload: SupabaseRealtimePayload<any>) => {
      console.log('UPDATE');
      doChanges(payload, changes);
    })
    .on('DELETE', async (payload: SupabaseRealtimePayload<any>) => {
      console.log('DELETE');
      doChanges(payload, deletes);
    })
    .subscribe();
  const db: databaseRegister = {
    name,
    remoteDB,
    subscription,
  };
  registeredDatabases.push(db);
  return db;
}
