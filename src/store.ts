/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import {
  createStore,
  compose,
  applyMiddleware,
  combineReducers,
  Reducer,
  StoreEnhancer,
} from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import { lazyReducerEnhancer } from 'pwa-helpers/lazy-reducer-enhancer';

import app, { AppState } from './reducers/app';
import { AppAction } from './actions/app';
import { AssignedDataAction, AssignedDataState } from './actions/assigneddata';
import { GroupDataAction, GroupDataState } from './actions/groupdata';
import { LabelDataAction, LabelDataState } from './actions/labeldata';
import { PolygonDataAction, PolygonDataState } from './actions/polygondata';
import { PostBoxAction, IPostBoxState } from './actions/postboxes';
import { PublicStreetAction, PublicStreetState } from './actions/publicstreet';
import { RoundDataAction, RoundDataState } from './actions/roundsdata';
import { SortboxAction, SortboxState } from './actions/sortboxes';
import { SortDataAction, SortDataState } from './actions/sortData';
import { StreetInfoAction, StreetInfoState } from './actions/streetInfo';
import { SyncStateAction, ISyncState } from './actions/syncState';
import { UsersAction, UsersState } from './actions/users';

declare global {
  interface Window {
    process?: Object;
    // eslint-disable-next-line no-undef
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

// Overall state extends static states and partials lazy states.
export interface RootState {
  app?: AppState;
  assignedData?: AssignedDataState;
  groupData?: GroupDataState;
  labelData?: LabelDataState;
  postBoxState?: IPostBoxState;
  polygonData?: PolygonDataState;
  publicStreetMap?: PublicStreetState;
  roundData?: RoundDataState;
  sortboxList?: SortboxState;
  sortDataList?: SortDataState;
  streetInfoData?: StreetInfoState;
  syncState?: ISyncState;
  userData?: UsersState;
}

export type RootAction =
  | AppAction
  | SyncStateAction
  | GroupDataAction
  | PolygonDataAction
  | RoundDataAction
  | SortboxAction
  | SortDataAction
  | AssignedDataAction
  | PostBoxAction
  | PublicStreetAction
  | StreetInfoAction
  | LabelDataAction
  | UsersAction;

// Sets up a Chrome extension for time travel debugging.
// See https://github.com/zalmoxisus/redux-devtools-extension for more information.
const devCompose: <Ext0, Ext1, StateExt0, StateExt1>(
  f1: StoreEnhancer<Ext0, StateExt0>,
  f2: StoreEnhancer<Ext1, StateExt1>
) => StoreEnhancer<Ext0 & Ext1, StateExt0 & StateExt1> =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Initializes the Redux store with a lazyReducerEnhancer (so that you can
// lazily add reducers after the store has been created) and redux-thunk (so
// that you can dispatch async actions). See the "Redux and state management"
// section of the wiki for more details:
// https://github.com/Polymer/pwa-starter-kit/wiki/4.-Redux-and-state-management
export const store = createStore(
  state => state as Reducer<RootState, RootAction>,
  devCompose(
    lazyReducerEnhancer(combineReducers),
    applyMiddleware(thunk as ThunkMiddleware<RootState, RootAction>)
  )
);

// Initially loaded reducers.
store.addReducers({
  app,
});
