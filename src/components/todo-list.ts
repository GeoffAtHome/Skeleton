/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { TextField } from '@material/mwc-textfield';
import { html, customElement, css, query, property } from 'lit-element';
import { PageViewElement } from './page-view-element';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';

// This element is connected to the Redux store.
import { store } from '../store';

import {
  defaultToDoItem,
  IToDo,
  toDoCreate,
  ToDoDataList,
} from '../actions/todo';

import './todo-item';

@customElement('todo-list')
export class TodoList extends PageViewElement {
  @query('#itemText')
  private itemText: TextField | undefined;

  @property({ type: Object })
  itemData: ToDoDataList = {};

  static get styles() {
    return [
      SharedStyles,
      css`
        .box {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
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

// mdc-text-field__input
// mdc-text-field__input
// --mdc-typography-mdc-text-field__input-text-decoration
// --mdc-typography-<STYLE>-text-decoration
