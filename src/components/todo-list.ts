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

import { IToDo, toDoCreate, ToDoDataList, toDoLoad } from '../actions/tododata';
// We are lazy loading its reducer.
import toDoData, { toDoDataSelector } from '../reducers/tododata';
import toDoFilterState, { toDoFilterSelector } from '../reducers/todostate';
import syncState, { syncStateSelector } from '../reducers/syncState';

import './todo-item';
import './todo-filter';
import './supa-base';

import { TODO_FILTERS } from '../actions/todostate';

const supabaseUrl = 'https://dcqztgqppnybtviaajcw.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNDI4MTQyMywiZXhwIjoxOTI5ODU3NDIzfQ.3w4Jfw4j58niBtqZOqx24Pyx6E3y3UGkq5ojuSEjhjo';

if (toDoDataSelector(store.getState()) === undefined) {
  store.addReducers({
    toDoData,
  });
}

if (toDoFilterSelector(store.getState()) === undefined) {
  store.addReducers({
    toDoFilterState,
  });
}

if (syncStateSelector(store.getState()) === undefined) {
  store.addReducers({
    syncState,
  });
}

@customElement('todo-list')
export class TodoList extends connect(store)(LitElement) {
  @query('#itemText')
  private itemText!: TextField;

  @property({ type: Object })
  itemData: ToDoDataList = {};

  @property({ type: String })
  syncState: string = '';

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

  protected render() {
    return html`
      <supa-base
        .supabaseKey=${supabaseKey}
        .supabaseUrl=${supabaseUrl}
        @SupaBaseReady=${this.loadData}
      ></supa-base>
      <h2>ToDo List</h2>
      <mwc-textfield
        id="itemText"
        label="What to do?"
        @keydown="${this.keydown}"
      ></mwc-textfield>
      ${Object.entries(this.itemData)
        .sort()
        .map(([key, item]) => {
          return html` <todo-item
            class="page"
            ?active=${this.currentFilter(item)}
            .key="${key}"
            .item="${item}"
          ></todo-item>`;
        })}
      <todo-filter .itemsLeft="${this.itemsLeft()}"></todo-filter>
      <div><h2>${this.syncState}</h2></div>
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

  // eslint-disable-next-line class-methods-use-this
  private loadData() {
    store.dispatch(toDoLoad());
  }

  stateChanged(state: RootState) {
    const toDoDataState = toDoDataSelector(state);

    if (toDoDataState !== undefined) {
      this.itemData = { ...toDoDataState._toDoList };
    }

    const filterState = toDoFilterSelector(state);

    if (filterState !== undefined) {
      this.currentFilter = filterState._currentFilter;
    }

    const syncStateS = syncStateSelector(state);
    this.syncState = syncStateS!._lastSyncState;
  }
}
