/**
 * @license
 * Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {
  html,
  customElement,
  property,
  css,
  query,
  LitElement,
} from 'lit-element';
import '@material/mwc-circular-progress';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';

@customElement('loading-spinner')
export class LoadingSpinner extends LitElement {
  @property({ type: Boolean })
  private loading: boolean = false;

  static get styles() {
    return [
      SharedStyles,
      css`
        .outerLoading {
          display: none;
        }

        .outerLoading[loading] {
          background: #80808080;
          place-items: center;
          position: fixed;
          width: 100%;
          height: 100%;
          z-index: 10;
          display: grid !important;
        }

        .innerLoading {
          width: 200px;
          background: #cccccc;
          color: white;
          text-align: center;
          padding: 4px;
        }
      `,
    ];
  }

  protected render() {
    return html`
      <div class="outerLoading" ?loading="${this.loading}">
        <div class="innerLoading">
          <div>
            <mwc-circular-progress indeterminate ?closed="${!this.loading}">
            </mwc-circular-progress>
          </div>
          <div>Loading...</div>
        </div>
      </div>
    `;
  }
}
