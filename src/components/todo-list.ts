/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { html, customElement, css } from 'lit-element';
import { PageViewElement } from './page-view-element';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';

@customElement('todo-list')
export class ToDoList extends PageViewElement {

  static get styles() {
    return [
      SharedStyles,
      css`
        .box {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }
        `
    ];
  }

  protected render() {
    return html`
      <h2>ToDo List</h2>
    `;
  }
}
