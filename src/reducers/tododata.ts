import { Reducer } from 'redux';
import {
  DataList,
  createPouchDB,
  createItemPouchDB,
  deleteItemPouchDB,
  readItemPouchDB,
  updateItemPouchDB,
  loadPouchDB,
} from './poucbDBInterface';

import {
  LOAD_TODO,
  CREATE_TODO,
  READ_TODO,
  UPDATE_TODO,
  DELETE_TODO,
  IToDoDataState,
  defaultToDoItem,
  LOADED_TODO,
  toDoLoaded,
  CLEAR_COMPLETED_TODO,
  CHANGES_TODO,
  toDoChanges,
  DELETES_TODO,
  toDoDeletes,
} from '../actions/tododata';

import { RootAction, RootState, store } from '../store';

const INITIAL_STATE: IToDoDataState = {
  _toDoList: {},
  _id: '',
  _item: defaultToDoItem,
};

function toDoChangesDispatch(docs: any) {
  store.dispatch(toDoChanges(docs));
}

function toDoDeletedDispatch(docs: any) {
  store.dispatch(toDoDeletes(docs));
}

const rootURL = 'https://scoutpostadmin.soord.org.uk:6984/';
// const rootURL = 'http://localhost:5984/';
const todoDB: PouchDB.Database = createPouchDB(
  'todo',
  rootURL,
  toDoChangesDispatch,
  toDoDeletedDispatch
);

const toDoData: Reducer<IToDoDataState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case LOAD_TODO:
      loadPouchDB(todoDB, toDoLoaded);
      return { ...state };

    case LOADED_TODO:
      return { ...state, _toDoList: { ...action._data } };

    case CREATE_TODO:
      createItemPouchDB(todoDB, action._item);
      return {
        ...state,
      };

    case READ_TODO:
      readItemPouchDB(todoDB, action._id);
      return {
        ...state,
        _id: action._id,
      };

    case UPDATE_TODO:
      updateItemPouchDB(todoDB, action._id, action._item);
      return {
        ...state,
      };

    case DELETE_TODO:
      deleteItemPouchDB(todoDB, action._id);
      return {
        ...state,
      };

    case CLEAR_COMPLETED_TODO:
      Object.entries(state._toDoList)
        .filter(item => {
          return item[1].completed;
        })
        .forEach(item => {
          deleteItemPouchDB(todoDB, item[0]);
        });
      return {
        ...state,
      };

    case CHANGES_TODO:
      return {
        ...state,
        _toDoList: { ...state._toDoList, ...action._docs },
      };

    case DELETES_TODO: {
      const newList = { ...state._toDoList };
      Object.keys(action._docs).forEach(key => {
        delete newList[key];
      });
      return {
        ...state,
        _toDoList: newList,
      };
    }

    default:
      return state;
  }
};

export default toDoData;

// Per Redux best practices, the shop data in our store is structured
// for efficiency (small size and fast updates).
//
// The _selectors_ below transform store data into specific forms that
// are tailored for presentation. Putting this logic here keeps the
// layers of our app loosely coupled and easier to maintain, since
// views don't need to know about the store's internal data structures.
//
// We use a tiny library called `reselect` to create efficient
// selectors. More info: https://github.com/reduxjs/reselect.

export const toDoDataSelector = (state: RootState) => state.toDoData;
