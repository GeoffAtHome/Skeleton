/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import {
  html,
  customElement,
  css,
  property,
  LitElement,
  query,
} from 'lit-element';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';

// This element is connected to the Redux store.
import { store } from '../store';
// These are the actions needed by this element.
import {
  toDoDelete,
  defaultToDoItem,
  IToDo,
  toDoUpdate,
} from '../actions/todo';

import '@material/mwc-button';
import '@material/mwc-checkbox';
import '@material/mwc-textfield';
import { TextField } from '@material/mwc-textfield';
import { Checkbox } from '@material/mwc-checkbox';

@customElement('todo-item')
export class TodoItem extends LitElement {
  @query('#itemText')
  private itemText: TextField | undefined;

  @query('#completed')
  private itemCompleted: Checkbox | undefined;

  @property({ type: Object })
  itemData: IToDo = defaultToDoItem;

  @property({ type: String })
  key = '';

  static get styles() {
    return [
      SharedStyles,
      css`
        :host {
          min-width: 200px;
          padding: 10px;
        }

        mwc-textfield[disabled] {
          text-decoration: line-through;
        }
      `,
    ];
  }

  protected render() {
    return html`<div>
      <mwc-checkbox
        id="completed"
        .checked=${this.itemData._completed}
        @change="${this.completedItem}"
      ></mwc-checkbox>
      <mwc-textfield
        id="itemText"
        .disabled=${this.itemData._completed}
        value=${this.itemData._title}
        @change="${this.updateItem}"
      ></mwc-textfield>
      <mwc-icon-button @click="${this.deleteItem}">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
          />
        </svg>
      </mwc-icon-button>
    </div>`;
  }

  private deleteItem() {
    store.dispatch(toDoDelete(this.key));
  }

  private completedItem() {
    if (this.itemCompleted !== undefined) {
      this.itemData._completed = this.itemCompleted?.checked;
      if (this.itemData._completed) {
        this.itemText?.setAttribute('disabled', '');
      } else {
        this.itemText?.removeAttribute('disabled');
      }

      store.dispatch(toDoUpdate(this.key, this.itemData));
    }
  }

  private updateItem() {
    if (this.itemText !== undefined) {
      const title = this.itemText.value.trim();
      if (this.itemData._title !== title) {
        this.itemData._title = title;
        store.dispatch(toDoUpdate(this.key, this.itemData));
      }
    }
  }
}
