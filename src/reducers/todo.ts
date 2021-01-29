
import { Reducer } from 'redux';
import { CREATE_TODO, READ_TODO, UPDATE_TODO, DELETE_TODO, IToDoDataState } from '../actions/todo';
import { RootAction, RootState } from '../store';

const INITIAL_STATE: IToDoDataState = {
  _toDoList: [],
  _index: '',
};

const toDoDataMap: Reducer<IToDoDataState, RootAction> = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case CREATE_TODO:
      return {
        ...state,
        _index: action._index
      }

    case READ_TODO:
      return {
        ...state,
        _index: action._index
      }

    case UPDATE_TODO:
      return {
        ...state,
        _index: action._index
      }

    case DELETE_TODO    :
      return {
        ...state,
        _index: action._index
      }


      default:
          return state;
  }
};


export default toDoDataMap;

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

export const toDoDataSelector = (state: RootState) => state.todoData;
