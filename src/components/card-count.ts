/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { html, customElement, css, property, LitElement } from 'lit-element';
import { CardAndCount } from './card-deck';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';

@customElement('card-count')
export class CardCount extends LitElement {
  @property({ type: Object })
  private card!: CardAndCount;

  static get styles() {
    return [
      SharedStyles,
      css`
        img {
          width: 200px;
          margin: 10px;
        }
        .count {
          text-align: center;
        }
        .deck {
          background-color: pink;
          display: grid;
          grid-template-rows: auto 1fr auto;
          justify-content: center;
        }
      `,
    ];
  }

  protected render() {
    return html`
      <div class="deck">
        <div>
          <img
            src="../../assets/small/${this.card.name}.png"
            alt="deck of cards"
            loading="lazy"
          />
        </div>
        <div class="count">${this.card.count}</div>
      </div>
    `;
  }

  protected firstUpdated(_changedProperties: any) {}
}
