import {
  html,
  customElement,
  css,
  query,
  property,
  LitElement,
} from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { TextField } from '@material/mwc-textfield';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';

// This element is connected to the Redux store.
import { RootState, store } from '../store';
// We are lazy loading its reducer.
import toDoData, { toDoDataSelector } from '../reducers/tododata';

import { IToDo, toDoCreate, ToDoDataList, toDoLoad } from '../actions/tododata';
// We are lazy loading its reducer.
import toDoFilter, { toDoFilterSelector } from '../reducers/todostate';

import './todo-item';
import './todo-filter';
import { TODO_FILTERS } from '../actions/todostate';

if (toDoDataSelector(store.getState()) === undefined) {
  store.addReducers({
    toDoData,
  });
}

if (toDoFilterSelector(store.getState()) === undefined) {
  store.addReducers({
    toDoFilter,
  });
}

@customElement('todo-list')
export class TodoList extends connect(store)(LitElement) {
  @query('#itemText')
  private itemText!: TextField;

  @property({ type: Object })
  itemData: ToDoDataList = {};

  currentFilter = TODO_FILTERS[0];

  static get styles() {
    return [
      SharedStyles,
      css`
        mwc-textfield {
          min-width: 200px;
        }
      `,
    ];
  }

  firstUpdated() {
    store.dispatch(toDoLoad());
  }

  protected render() {
    return html`
      <h2>ToDo List</h2>
      <mwc-textfield
        id="itemText"
        label="What to do?"
        @keydown="${this.keydown}"
      ></mwc-textfield>
      ${Object.entries(this.itemData)
        .filter(this.currentFilter)
        .map(([key, item]) => {
          return html` <todo-item .key="${key}" .item="${item}"></todo-item>`;
        })}
      <todo-filter .itemsLeft="${this.itemsLeft()}"></todo-filter>
    `;
  }

  private keydown(e: KeyboardEvent) {
    if (e.code === 'Enter') {
      if (this.itemText !== undefined) {
        const title = this.itemText.value.trim();
        const newItem: IToDo = {
          completed: false,
          editing: false,
          title,
        };
        store.dispatch(toDoCreate(newItem));
        this.itemText.value = '';
      }
    }
  }

  private itemsLeft() {
    const items = Object.entries(this.itemData).filter(([key, item]) => {
      return item.completed === false;
    }).length;

    return items;
  }

  stateChanged(state: RootState) {
    const toDoDataState = toDoDataSelector(state);

    if (toDoDataState !== undefined) {
      this.itemData = { ...toDoDataState._toDoList };
    }

    const toDoFilterState = toDoFilterSelector(state);

    if (toDoFilterState !== undefined) {
      this.currentFilter = toDoFilterState._currentFilter;
    }
  }
}
