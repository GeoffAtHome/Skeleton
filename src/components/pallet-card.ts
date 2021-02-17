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
  internalProperty,
} from 'lit-element';
import { Card, CardAndCount, createDeck, shuffleDeck } from './card-deck';
import { PageViewElement } from './page-view-element';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';
import '@material/mwc-button';
import './card-count';
// eslint-disable-next-line import/no-duplicates
import './player-view';
// eslint-disable-next-line import/no-duplicates
import { Player } from './player-view';

function getHand(player: Player) {
  const newHand = [...player.hand];
  return newHand;
}

@customElement('pallet-card')
export class PalletCard extends PageViewElement {
  @property({ type: Array })
  private pallet: Array<Card> = [];

  @internalProperty()
  private deck: Array<Card> = [];

  @internalProperty()
  private discard: Array<Card> = [];

  @internalProperty()
  private lastCard = 'discard';

  @internalProperty()
  private players: Array<Player> = [];

  static get styles() {
    return [
      SharedStyles,
      css`
        .parent {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }

        mwc-button {
          width: 200px;
        }

        .top {
          display: grid;
          grid-template: auto 1fr auto / auto 1fr auto;
          justify-content: center;
        }

        .card {
          flex: 1 1 150px;
          margin: 5px;
        }

        img {
          width: 200px;
        }
        .count {
          text-align: center;
        }

        .board {
          display: grid;
          grid-template-columns: minmax(200px, 15%) 1fr;
        }

        .deck {
          background-color: pink;
          display: grid;
          grid-template-rows: auto 1fr auto;
          justify-content: center;
        }
        .pallet {
          display: grid;
          grid-template-rows: auto 1fr auto;
          justify-content: center;
        }

        .hand {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }
      `,
    ];
  }

  protected render() {
    return html`
      <div class="top">
        <mwc-button id="addGroup" raised @click="${this.shuffleDeck}"
          >Shuffle deck</mwc-button
        >
        <mwc-button id="addGroup" raised @click="${this.dealCards}"
          >Deal cards</mwc-button
        >
      </div>

      <div class="board">
        <div>
          <card-count
            .card="${{ name: 'front', count: this.deck.length }}"
          ></card-count>
          <card-count
            .card="${{ name: this.lastCard, count: this.discard.length }}"
          ></card-count>
        </div>
        <div class="pallet">
          ${this.pallet.map(item => {
            return html` <div class="card">
              <img
                src="../../assets/small/${item.name}.png"
                alt="${item.name}"
                loading="lazy"
              />
            </div>`;
          })}
        </div>
      </div>

      <div>
        <div class="players">
          ${this.players.map(player => {
            return html`<player-view
              .hand="${getHand(player)}"
              .player="${player.name}"
            ></player-view>`;
          })}
        </div>
      </div>
    `;
  }

  protected firstUpdated(_changedProperties: any) {
    this.deck = shuffleDeck(createDeck());
    this.players = [
      { name: 'Alison', hand: [] },
      { name: 'Geoff', hand: [] },
      { name: 'Jimmy', hand: [] },
      { name: 'Emily', hand: [] },
    ];
  }

  private shuffleDeck() {
    this.deck = shuffleDeck(this.deck);
  }

  private dealCards() {
    const newPallet: Array<Card> = [];
    for (const player of this.players) {
      const hand: Array<Card> = [];
      let initialCards = 4;
      while (initialCards) {
        initialCards -= 1;
        hand.push(this.deck.pop()!);
      }

      player.hand = [...player.hand, ...hand];
    }
    if (this.deck.length !== 0) newPallet.push(this.deck.pop()!);
    if (this.deck.length !== 0) newPallet.push(this.deck.pop()!);
    if (this.deck.length !== 0) newPallet.push(this.deck.pop()!);
    if (this.deck.length !== 0) newPallet.push(this.deck.pop()!);
    if (this.deck.length !== 0) newPallet.push(this.deck.pop()!);

    this.pallet = newPallet;
  }
}
