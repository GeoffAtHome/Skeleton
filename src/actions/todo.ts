import { Action, ActionCreator } from 'redux';

export const CREATE_TODO = 'CREATE_TODO';
export const READ_TODO = 'READ_TODO';
export const UPDATE_TODO = 'UPDATE_TODO';
export const DELETE_TODO = 'DELETE_TODO';

export interface IToDo {
  _completed: boolean;
  _editing: boolean;
  _title: string;
}

export interface ToDoDataList {
  [index: string]: IToDo;
}

export const defaultToDoItem: IToDo = {
  _completed: false,
  _editing: false,
  _title: 'Hello',
};
export interface IToDoDataState {
  _toDoList: ToDoDataList;
  _index: string;
  _item: IToDo;
}

export interface ToDoCreate extends Action<'CREATE_TODO'> {
  _item: IToDo;
}
export interface ToDoRead extends Action<'READ_TODO'> {
  _index: string;
}
export interface ToDoUpdate extends Action<'UPDATE_TODO'> {
  _index: string;
  _item: IToDo;
}
export interface ToDoDelete extends Action<'DELETE_TODO'> {
  _index: String;
}

export type ToDoAction = ToDoCreate | ToDoRead | ToDoUpdate | ToDoDelete;

export const toDoCreate: ActionCreator<ToDoCreate> = _item => {
  return {
    type: CREATE_TODO,
    _item,
  };
};

export const toDoRead: ActionCreator<ToDoRead> = _index => {
  return {
    type: READ_TODO,
    _index,
  };
};

export const toDoUpdate: ActionCreator<ToDoUpdate> = (_index, _item) => {
  return {
    type: UPDATE_TODO,
    _index,
    _item,
  };
};

export const toDoDelete: ActionCreator<ToDoDelete> = _index => {
  return {
    type: DELETE_TODO,
    _index,
  };
};
