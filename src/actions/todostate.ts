import { Action, ActionCreator } from 'redux';
import { IToDo } from './tododata';

export const FILTER_CHANGE = 'FILTER_CHANGE';

export const filterStates = ['All', 'Completed', 'Active'];
export type IFilters = 'All' | 'Active' | 'Completed';

export interface FilterFunctionList {
  [index: string]: any;
}

export const TODO_FILTERS: FilterFunctionList = [
  (todo: [string, IToDo]) => true,
  (todo: [string, IToDo]) => !todo[1].completed,
  (todo: [string, IToDo]) => todo[1].completed,
];

export interface IFilterState {
  _currentFilterName: string;
  _currentFilter: any;
}

export interface FilterStateChange extends Action<'FILTER_CHANGE'> {
  _filter: string;
}

export type FilterStateAction = FilterStateChange;

export const filterStateChange: ActionCreator<FilterStateChange> = _filter => {
  return {
    type: FILTER_CHANGE,
    _filter,
  };
};
