import { Reducer } from 'redux';

import {
  filterStates,
  FILTER_CHANGE,
  IFilterState,
  TODO_FILTERS,
} from '../actions/todostate';

import { RootAction, RootState } from '../store';

const INITIAL_STATE: IFilterState = {
  _currentFilterName: 'All',
  // eslint-disable-next-line dot-notation
  _currentFilter: TODO_FILTERS[0],
};

const toDoFilterState: Reducer<IFilterState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case FILTER_CHANGE:
      return {
        ...state,
        _currentFilterName: action._filter,
        _currentFilter: TODO_FILTERS[filterStates.indexOf(action._filter)],
      };

    default:
      return state;
  }
};

export default toDoFilterState;

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

export const toDoFilterSelector = (state: RootState) => state.toDoFilter;
