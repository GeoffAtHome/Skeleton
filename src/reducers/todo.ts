import { Reducer } from 'redux';

import {
  LOAD_TODO,
  CREATE_TODO,
  READ_TODO,
  UPDATE_TODO,
  DELETE_TODO,
  IToDoDataState,
  defaultToDoItem,
} from '../actions/todo';

import { RootAction, RootState } from '../store';
import {
  createDB,
  createItem,
  deleteItem,
  readItem,
  updateItem,
} from './poucbDBInterface';

const INITIAL_STATE: IToDoDataState = {
  _toDoList: {},
  _index: '',
  _item: defaultToDoItem,
};

const todoDB: PouchDB.Database = await createDB('todo');

const toDoData: Reducer<IToDoDataState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case LOAD_TODO:
      // eslint-disable-next-line no-param-reassign
      state._toDoList = { ...action._data };
      return { ...state };

    case CREATE_TODO:
      createItem(todoDB, action._item);
      // eslint-disable-next-line no-param-reassign
      state._toDoList[Date.now()] = { ...action._item };
      return {
        ...state,
      };

    case READ_TODO:
      readItem(todoDB, action._index);
      return {
        ...state,
        _index: action._index,
      };

    case UPDATE_TODO:
      updateItem(todoDB, { ...action._item });
      // eslint-disable-next-line no-param-reassign
      state._toDoList[action._index] = { ...action._item };
      return {
        ...state,
      };

    case DELETE_TODO:
      deleteItem(todoDB, action._index);
      // eslint-disable-next-line no-param-reassign
      delete state._toDoList[action._index.toString()];
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
