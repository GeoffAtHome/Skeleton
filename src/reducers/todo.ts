import { Reducer } from 'redux';
import {
  CREATE_TODO,
  READ_TODO,
  UPDATE_TODO,
  DELETE_TODO,
  IToDoDataState,
  defaultToDoItem,
} from '../actions/todo';
import { RootAction, RootState } from '../store';

const INITIAL_STATE: IToDoDataState = {
  _toDoList: {},
  _index: '',
  _item: defaultToDoItem,
};

const toDoData: Reducer<IToDoDataState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case CREATE_TODO:
      const key = Date.now();
      state._toDoList[key] = { ...action._item };
      return {
        ...state,
      };

    case READ_TODO:
      return {
        ...state,
        _index: action._index,
      };

    case UPDATE_TODO:
      state._toDoList[action._index] = { ...action._item };
      return {
        ...state,
      };

    case DELETE_TODO:
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
