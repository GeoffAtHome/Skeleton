import { Action, ActionCreator } from 'redux';
import { DataList } from '../reducers/poucbDBInterface';

export const LOAD_TODO = 'LOAD_TODO';
export const LOADED_TODO = 'LOADED_TODO';
export const CREATE_TODO = 'CREATE_TODO';
export const READ_TODO = 'READ_TODO';
export const UPDATE_TODO = 'UPDATE_TODO';
export const DELETE_TODO = 'DELETE_TODO';
export const CLEAR_COMPLETED_TODO = 'CLEAR_COMPLETED_TODO';
export const CHANGES_TODO = 'CHANGES_TODO';
export const DELETES_TODO = 'DELETES_TODO';

export interface IToDo {
  completed: boolean;
  editing: boolean;
  title: string;
}

export interface ToDoDataList {
  [index: string]: IToDo;
}

export const defaultToDoItem: IToDo = {
  completed: false,
  editing: false,
  title: 'Hello',
};
export interface IToDoDataState {
  _toDoList: ToDoDataList;
  _id: string;
  _item: IToDo;
}

export interface ToDoLoad extends Action<'LOAD_TODO'> {}
export interface ToDoLoaded extends Action<'LOADED_TODO'> {
  _data: ToDoDataList;
}

export interface ToDoCreate extends Action<'CREATE_TODO'> {
  _item: IToDo;
}

export interface ToDoRead extends Action<'READ_TODO'> {
  _id: string;
}
export interface ToDoUpdate extends Action<'UPDATE_TODO'> {
  _id: string;
  _item: IToDo;
}
export interface ToDoDelete extends Action<'DELETE_TODO'> {
  _id: string;
}

export interface ToDoClearCompleted extends Action<'CLEAR_COMPLETED_TODO'> {}
export interface ToDoChanges extends Action<'CHANGES_TODO'> {
  _docs: ToDoDataList;
}

export interface ToDoDeletes extends Action<'DELETES_TODO'> {
  _docs: ToDoDataList;
}

export type ToDoAction =
  | ToDoLoad
  | ToDoLoaded
  | ToDoCreate
  | ToDoRead
  | ToDoUpdate
  | ToDoDelete
  | ToDoClearCompleted
  | ToDoChanges
  | ToDoDeletes;

export const toDoLoad: ActionCreator<ToDoLoad> = () => {
  return {
    type: LOAD_TODO,
  };
};

export const toDoLoaded: ActionCreator<ToDoLoaded> = _data => {
  return {
    type: LOADED_TODO,
    _data,
  };
};

export const toDoCreate: ActionCreator<ToDoCreate> = _item => {
  return {
    type: CREATE_TODO,
    _item,
  };
};

export const toDoUpdate: ActionCreator<ToDoUpdate> = (_id, _item) => {
  return {
    type: UPDATE_TODO,
    _id,
    _item,
  };
};

export const toDoDelete: ActionCreator<ToDoDelete> = _id => {
  return {
    type: DELETE_TODO,
    _id,
  };
};

export const toDoClearCompleted: ActionCreator<ToDoClearCompleted> = () => {
  return {
    type: CLEAR_COMPLETED_TODO,
  };
};

export const toDoChanges: ActionCreator<ToDoChanges> = _docs => {
  return {
    type: CHANGES_TODO,
    _docs,
  };
};

export const toDoDeletes: ActionCreator<ToDoDeletes> = _docs => {
  return {
    type: DELETES_TODO,
    _docs,
  };
};
