import { Action, ActionCreator } from 'redux';

export const SYNC_STATE = 'SYNC_STATE';
export const SYNC_CHANGES_TODO = 'SYNC_CHANGES_TODO';
export const SYNC_DELETES_TODO = 'SYNC_DELETES_TODO';

export interface ISync {
  status: string;
}

export interface SyncDataList {
  [index: string]: ISync;
}

export interface ISyncState {
  _lastSyncState: string;
  _lastSyncDatabase: string;
  _docs: SyncDataList;
}

export interface SyncStateChange extends Action<'SYNC_STATE'> {
  _databaseName: string;
  _status: string;
}

export interface SyncChanges extends Action<'SYNC_CHANGES_TODO'> {
  _docs: SyncDataList;
}

export interface SyncDeletes extends Action<'SYNC_DELETES_TODO'> {
  _docs: SyncDataList;
}

export type SyncStateAction = SyncStateChange | SyncChanges | SyncDeletes;

export const syncStateChange: ActionCreator<SyncStateChange> = (
  _databaseName,
  _status
) => {
  return {
    type: SYNC_STATE,
    _databaseName,
    _status,
  };
};

export const syncChanges: ActionCreator<SyncChanges> = _docs => {
  return {
    type: SYNC_CHANGES_TODO,
    _docs,
  };
};

export const syncDeletes: ActionCreator<SyncDeletes> = _docs => {
  return {
    type: SYNC_DELETES_TODO,
    _docs,
  };
};

export function fullyLoaded(
  publicDB: Array<string>,
  userDB: Array<string>,
  userId: string,
  status: SyncDataList
) {
  if (status === {}) return true;

  for (const db of publicDB) {
    if (status[db] === undefined || status[db].status !== 'Complete')
      return true;
  }
  for (const db of userDB) {
    const dbName = `${db}${userId}`;
    if (status[dbName] === undefined || status[dbName].status !== 'Complete')
      return true;
  }
  return false;
}
