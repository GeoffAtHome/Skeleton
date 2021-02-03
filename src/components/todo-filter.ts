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
import '@material/mwc-tab-bar';
// eslint-disable-next-line import/no-duplicates
import { TabBar } from '@material/mwc-tab-bar';
import '@material/mwc-tab';

// These are the actions needed by this element.
import { IToDo, toDoClearCompleted } from '../actions/tododata';

// This element is connected to the Redux store.
import { store } from '../store';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';
import {
  filterStateChange,
  filterStates,
  IFilters,
} from '../actions/todostate';

@customElement('todo-filter')
export class TodoFilter extends LitElement {
  @query('#tabs')
  private tabs!: TabBar;

  @property({ type: Number })
  itemsLeft: Number = 0;

  @property({ type: String })
  filterState: IFilters = 'All';

  @property({ type: String })
  key = '';

  static get styles() {
    return [
      SharedStyles,
      css`
        :host {
          display: grid;
          grid-gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }

        .itemsLeft {
          padding: 5px;
          text-align: right;
        }
      `,
    ];
  }

  protected render() {
    return html` <div class="itemsLeft">Items left: ${this.itemsLeft}</div>
      <div>
        <mwc-tab-bar
          id="tabs"
          activeIndex="${filterStates.indexOf(this.filterState)}"
        >
          <mwc-tab label="All" name="All" @click=${this.onClickTab}></mwc-tab>
          <mwc-tab
            label="Active"
            name="Active"
            @click=${this.onClickTab}
          ></mwc-tab>
          <mwc-tab
            label="Completed"
            name="Completed"
            @click=${this.onClickTab}
          ></mwc-tab>
        </mwc-tab-bar>
      </div>
      <div class="box">
        <mwc-button @click="${this.onClearCompleted}"
          >Clear completed
        </mwc-button>
      </div>`;
  }

  // eslint-disable-next-line class-methods-use-this
  private onClickTab(e: MouseEvent) {
    const filter = filterStates[this.tabs.activeIndex];
    store.dispatch(filterStateChange(filter));
  }

  // eslint-disable-next-line class-methods-use-this
  private onClearCompleted() {
    store.dispatch(toDoClearCompleted());
  }
}
