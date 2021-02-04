import { Action, ActionCreator } from 'redux';

export const SYNC_STATE = 'SYNC_STATE';

export interface ISyncState {
  _lastSyncState: string;
}

export interface SyncStateChange extends Action<'SYNC_STATE'> {
  _state: string;
}

export type SyncStateAction = SyncStateChange;

export const syncStateChange: ActionCreator<SyncStateAction> = _state => {
  return {
    type: SYNC_STATE,
    _state,
  };
};
