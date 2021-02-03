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

import '@material/mwc-button';
// eslint-disable-next-line import/no-duplicates
import '@material/mwc-checkbox';
// eslint-disable-next-line import/no-duplicates
import '@material/mwc-textfield';
// eslint-disable-next-line import/no-duplicates
import { Checkbox } from '@material/mwc-checkbox';
// eslint-disable-next-line import/no-duplicates
import { TextField } from '@material/mwc-textfield';

// These are the actions needed by this element.
import { toDoDelete, IToDo, toDoUpdate } from '../actions/tododata';

// This element is connected to the Redux store.
import { store } from '../store';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';

@customElement('todo-item')
export class TodoItem extends LitElement {
  @query('#itemText')
  private itemText!: TextField;

  @query('#completed')
  private itemCompleted!: Checkbox;

  @property({ type: Object })
  item!: IToDo;

  @property({ type: String })
  key = '';

  static get styles() {
    return [
      SharedStyles,
      css`
        :host {
          min-width: 200px;
          padding: 10px;
          display: block;
        }

        mwc-textfield[disabled] {
          text-decoration: line-through;
        }
      `,
    ];
  }

  protected render() {
    return html`
      <mwc-checkbox
        id="completed"
        ?checked=${this.item.completed}
        @change="${this.completedItem}"
      ></mwc-checkbox>
      <mwc-textfield
        id="itemText"
        ?disabled=${this.item.completed}
        value=${this.item.title}
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
    `;
  }

  private deleteItem() {
    store.dispatch(toDoDelete(this.key));
  }

  private completedItem() {
    this.item.completed = this.itemCompleted.checked;

    // eslint-disable-next-line no-unused-expressions
    this.item.completed
      ? this.itemText.setAttribute('disabled', '')
      : this.itemText.removeAttribute('disabled');
    store.dispatch(toDoUpdate(this.key, this.item));
  }

  private updateItem() {
    const title = this.itemText.value.trim();
    if (this.item.title !== title) {
      this.item.title = title;
      store.dispatch(toDoUpdate(this.key, this.item));
    }
  }
}
