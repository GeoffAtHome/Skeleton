import { Reducer } from 'redux';

import {
  LOAD_TODO,
  CREATE_TODO,
  READ_TODO,
  UPDATE_TODO,
  DELETE_TODO,
  IToDoDataState,
  defaultToDoItem,
  toDoCreated,
  CREATED_TODO,
  LOADED_TODO,
  toDoLoaded,
  CLEAR_COMPLETED_TODO,
} from '../actions/tododata';

import { RootAction, RootState } from '../store';
import {
  createPouchDB,
  createItemPouchDB,
  deleteItemPouchDB,
  readItemPouchDB,
  updateItemPouchDB,
  loadPouchDB,
} from './poucbDBInterface';

const INITIAL_STATE: IToDoDataState = {
  _toDoList: {},
  _id: '',
  _item: defaultToDoItem,
};

const todoDB: PouchDB.Database = createPouchDB('todo');

const toDoData: Reducer<IToDoDataState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case LOAD_TODO:
      loadPouchDB(todoDB, toDoLoaded);
      return { ...state };

    case LOADED_TODO:
      // eslint-disable-next-line no-param-reassign
      state._toDoList = { ...action._data };
      return { ...state };

    case CREATE_TODO:
      createItemPouchDB(todoDB, action._item, toDoCreated);
      return {
        ...state,
      };

    case CREATED_TODO:
      // eslint-disable-next-line no-param-reassign
      state._toDoList[action._id] = { ...action._item };
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
      updateItemPouchDB(todoDB, { ...action._item });
      // eslint-disable-next-line no-param-reassign
      state._toDoList[action._id] = { ...action._item };
      return {
        ...state,
      };

    case DELETE_TODO:
      deleteItemPouchDB(todoDB, action._id);
      // eslint-disable-next-line no-param-reassign
      delete state._toDoList[action._id.toString()];
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
          // eslint-disable-next-line no-param-reassign
          delete state._toDoList[item[0].toString()];
        });
      return {
        ...state,
      };
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
