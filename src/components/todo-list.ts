import { html, customElement, css, query, property } from 'lit-element';
import { PageViewElement } from './page-view-element';
import '@material/mwc-textfield';
import { TextField } from '@material/mwc-textfield';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';

// This element is connected to the Redux store.
import { store } from '../store';

import { IToDo, toDoCreate, ToDoDataList } from '../actions/todo';

import './todo-item';

@customElement('todo-list')
export class TodoList extends PageViewElement {
  @query('#itemText')
  private itemText!: TextField;

  @property({ type: Object })
  itemData: ToDoDataList = {};

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
      <h2>ToDo List</h2>
      <mwc-textfield
        id="itemText"
        label="What to do?"
        @keydown="${this.keydown}"
        @blur="${this.blurItem}"
      ></mwc-textfield>
      ${Object.entries(this.itemData)
        .filter(this.filterItems)
        .map(([key, item]) => {
          return html` <todo-item .key="${key}" .item="${item}"></todo-item>`;
        })}
    `;
  }

  private keydown(e: KeyboardEvent) {
    if (e.code === 'Enter') {
      if (this.itemText !== undefined) {
        const title = this.itemText.value.trim();
        const newItem: IToDo = {
          _completed: false,
          _editing: false,
          _title: title,
        };
        store.dispatch(toDoCreate(newItem));
        this.itemText.value = '';
      }
    }
  }

  private blurItem(e: FocusEvent) {
    console.log('Blur');
  }

  private filterItems(value: [key: string, item: IToDo]) {
    return value[1]._completed === false;
  }
}
