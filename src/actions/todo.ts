import { Action, ActionCreator } from 'redux';

export const CREATE_TODO = 'CREATE_TODO'
export const READ_TODO = 'READ_TODO'
export const UPDATE_TODO = 'UPDATE_TODO'
export const DELETE_TODO = 'DELETE_TODO'

export interface IToDo {
  _completed: boolean;
  _editing: boolean;
  _title: String;
}

export interface IToDoDataState {
  _toDoList: Array<IToDo>,
  _index: string,
}


export interface ToDoCreate extends Action<'CREATE_TODO'> { _index: string };
export interface ToDoRead extends Action<'READ_TODO'> { _index: string };
export interface ToDoUpdate extends Action<'UPDATE_TODO'> { _index: string };
export interface ToDoDelete extends Action<'DELETE_TODO'> { _index: string };

export type ToDoAction = ToDoCreate | ToDoRead | ToDoUpdate | ToDoDelete


export const  toDoCreate: ActionCreator<ToDoCreate> = (_index) => {
  return ({
    type: CREATE_TODO,
    _index
  })
}

export const  toDoRead: ActionCreator<ToDoRead> = (_index) => {
  return ({
    type: READ_TODO,
    _index
  })
}

export const  toDoUpdate: ActionCreator<ToDoUpdate> = (_index) => {
  return ({
    type: UPDATE_TODO,
    _index
  })
}

export const  toDoDelete: ActionCreator<ToDoDelete> = (_index) => {
  return ({
    type: DELETE_TODO,
    _index
  })
}

