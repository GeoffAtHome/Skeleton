/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { html, customElement, css, property } from 'lit-element';
import { Card, createDeck, shuffleDeck } from './card-deck';
import { PageViewElement } from './page-view-element';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';
import '@material/mwc-button';

@customElement('game-card')
export class GameCard extends PageViewElement {
  @property({ type: Array })
  private deck: Array<Card> = [];

  static get styles() {
    return [
      SharedStyles,
      css`
        .parent {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }

        .card {
          flex: 1 1 150px;
          margin: 5px;
        }

        img {
          width: 200px;
        }
      `,
    ];
  }

  protected render() {
    return html` <h2>Game Card</h2>
      <mwc-button id="addGroup" raised @click="${this.shuffleDeck}"
        >Shuffle deck</mwc-button
      >

      <div class="parent">
        ${this.deck.map(item => {
          return html` <div class="card">
            <img
              src="../../assets/small/${item.name}.png"
              alt="${item.name}"
              loading="lazy"
            />
          </div>`;
        })}
      </div>`;
  }

  protected firstUpdated(_changedProperties: any) {
    this.deck = createDeck();
  }

  private shuffleDeck() {
    this.deck = shuffleDeck(this.deck);
  }
}
