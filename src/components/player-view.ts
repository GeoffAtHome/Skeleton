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
  PropertyValues,
  internalProperty,
} from 'lit-element';
import { Card, CardAndCount } from './card-deck';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';
import './card-count';

export interface Player {
  name: string;
  hand: Array<Card>;
}

function getHand(hand: Array<Card>) {
  const set = new Set(hand);
  const sortedHand: Array<CardAndCount> = [];
  set.forEach(cardType => {
    sortedHand.push({
      name: cardType.name,
      count: hand.filter(card => card.name === cardType.name).length,
    });
  });

  return sortedHand;
}

@customElement('player-view')
export class PlayerView extends LitElement {
  @property({ type: String })
  private player = '';

  @property({ type: Array })
  hand: Array<Card> = [];

  @internalProperty()
  theHand: Array<CardAndCount> = [];

  static get styles() {
    return [
      SharedStyles,
      css`
        .hand {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }
      `,
    ];
  }

  protected render() {
    return html` <div class="player">
      <h2>${this.player}: ${this.hand.length}</h2>
      <div class="hand">
        ${this.theHand.map(item => {
          return html`<div>
            <card-count .card="${item}"></card-count>
          </div>`;
        })}
      </div>
    </div>`;
  }

  updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('hand')) {
      this.theHand = getHand(this.hand);
    }
  }
}
