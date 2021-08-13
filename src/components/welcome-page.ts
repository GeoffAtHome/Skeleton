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
import { connect } from 'pwa-helpers/connect-mixin';
import { userDataSelector } from '../reducers/users';
import { RootState, store } from '../store';
import { PageViewElement } from './page-view-element';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';

@customElement('welcome-page')
export class WelcomePage extends connect(store)(PageViewElement) {
  @property({ type: Boolean })
  private admin: boolean = false;

  static get styles() {
    return [
      SharedStyles,
      css`
        :host {
          display: block;
          padding: 10px;
        }
      `,
    ];
  }

  protected render() {
    return html`
      <section>
        ${this.admin === true
          ? html`<h2>Scout Post Admin</h2>
              <p>
                This is the main admin app for the Cardiff and Vale Scout Post
                scheme. If has the complete list of addresses in the area as
                supplied from the Royal Mail. The list of address are updated by
                the Royal Mail every three months.
              </p>

              <p>
                The main purpose of this app is to assign streets (Postcodes) to
                groups for sorting purposes. In addition, where stamps can be
                purchased and letters delivered can be added, deleted and
                modified.
              </p>

              <p>This app - this application requires authentication.</p> `
          : html`<h2>Scout Post Group Admin</h2>

              <p>
                This app allows streets to be assigned to rounds. A typical
                round is a groups of streets in close proximity that can be
                delivered together.
              </p>
              <p>
                Each street can edited to add notes and labels to the map. The
                polygon that represents the street on the map can also be edited
              </p>

              <p>this application requires authentication.</p>`}
      </section>
      <section>
        <h2>Other applications</h2>
        <p>
          <b
            ><a href="https://scout-post.web.app"
              >https://scout-post.web.app</a
            ></b
          >
        </p>
        <p>
          Scout Post public app for displaying where we deliver and where stamps
          can be purchased and cards posted
        </p>

        <p>
          <b
            ><a href="https://scout-post-scouts.web.app"
              >https://scout-post-scouts.web.app</a
            ></b
          >
        </p>
        <p>
          Scout Post Scouts app is similar to Scout Post public but contains a
          complete list of all address rather than just street level
          information. It also display the sorting box details for the address
        </p>
      </section>
    `;
  }

  stateChanged(state: RootState) {
    if (state.app?.page === 'welcome') {
      const usersState = userDataSelector(state);
      this.admin = usersState!._newUser.claims.administrator;
    }
  }
}
