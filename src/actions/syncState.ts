import { Action, ActionCreator } from 'redux';

export const SYNC_STATE = 'SYNC_STATE';
export const SYNC_CHANGES_TODO = 'SYNC_CHANGES_TODO';
export const SYNC_DELETES_TODO = 'SYNC_DELETES_TODO';

export interface ISync {
  databaseName: string;
}

export interface SyncDataList {
  [index: string]: ISync;
}

export interface ISyncState {
  _lastSyncState: string;
  _docs: SyncDataList;
}

export interface SyncStateChange extends Action<'SYNC_STATE'> {
  _state: string;
}

export interface SyncChanges extends Action<'SYNC_CHANGES_TODO'> {
  _docs: SyncDataList;
}

export interface SyncDeletes extends Action<'SYNC_DELETES_TODO'> {
  _docs: SyncDataList;
}

export type SyncStateAction = SyncStateChange | SyncChanges | SyncDeletes;

export const syncStateChange: ActionCreator<SyncStateAction> = _state => {
  return {
    type: SYNC_STATE,
    _state,
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
