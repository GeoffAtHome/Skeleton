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
  LitElement,
  html,
  css,
  property,
  customElement,
  query,
} from 'lit-element';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings';
import { connect } from 'pwa-helpers/connect-mixin';
import { installMediaQueryWatcher } from 'pwa-helpers/media-query';
import { installOfflineWatcher } from 'pwa-helpers/network';
import { installRouter } from 'pwa-helpers/router';

// This element is connected to the Redux store.
import { store, RootState } from '../store';

// These are the actions needed by this element.
import { navigate, updateOffline, updateDrawerState } from '../actions/app';

// These are the elements needed by this element.
import '@material/mwc-top-app-bar';
import '@material/mwc-drawer';
import '@material/mwc-button';
import '@pwabuilder/pwainstall';
import '@pwabuilder/pwaupdate';
import { menuIcon, arrowBackIcon, logOutIcon } from './my-icons';
import './snack-bar';
import { logUserIn, logUserOut } from './user-login';
import { userDataSelector } from '../reducers/users';

function _BackButtonClicked() {
  window.history.back();
}

function _logOutButtonClicked() {
  logUserOut();
}

function getTitle(page: string) {
  let title = '';

  switch (page) {
    default:
    case 'welcome':
      title = 'Cardiff and Vale Scout Post Admin';
      break;
    case 'todo':
      title = 'ToDo List';
      break;

    case 'assignStreets':
      title = 'Assign Streets';
      break;

    case 'sortBoxAdmin':
      title = 'Sort Box Admin';
      break;

    case 'assignSortBox':
      title = 'Assign Sort Box';
      break;

    case 'sortBoxes':
      title = 'Sort Boxes';
      break;

    case 'whereWeDeliverEdit':
      title = 'where We Deliver Edit';
      break;

    case 'postBoxView':
      title = 'Post Box View';
      break;

    case 'editPostBoxView':
      title = 'Edit Post Box View';
      break;

    case 'groupAdmin':
      title = 'Group Admin';
      break;

    case 'userLogin':
      title = 'User Login';
      break;

    case 'rounds':
      title = 'Rounds';
      break;
  }
  return title;
}
@customElement('my-app')
export class MyApp extends connect(store)(LitElement) {
  @query('#track')
  private track: any;

  @property({ type: String })
  appTitle = '';

  @property({ type: String })
  private _page = '';

  @property({ type: Boolean })
  private _drawerOpened = false;

  @property({ type: Boolean })
  private _snackbarOpened = false;

  @property({ type: String })
  private _message: string = '';

  @property({ type: Boolean })
  private _offline = false;

  @property({ type: Boolean })
  private _admin: boolean = false;

  @property({ type: Boolean })
  private _member: boolean = false;

  @property({ type: Boolean })
  private _loggedIn: boolean = false;

  @property({ type: String })
  private _groupId: string = '';

  @property({ type: String })
  private _displayName: string = '';

  private startX: number = 0;

  private startY: number = 0;

  static get styles() {
    return [
      css`
        :host {
          display: block;

          --app-primary-color: #e91e63;
          --app-secondary-color: #293237;
          --app-dark-text-color: var(--app-secondary-color);
          --app-light-text-color: white;
          --app-section-even-color: #f7f7f7;
          --app-section-odd-color: white;
          --mdc-drawer-width: 170px;
          --mdc-theme-primary: #7413dc;
        }

        .parent {
          display: grid;
          grid-template-rows: 1fr auto;
        }

        .content {
          display: grid;
          grid-template-columns: minmax(0px, 0%) 1fr;
        }

        [main-title] {
          font-family: 'Pacifico';
          text-transform: lowercase;
          font-size: 30px;
          /* In the narrow layout, the toolbar is offset by the width of the
          drawer button, and the text looks not centered. Add a padding to
          match that button */
          padding-right: 44px;
        }

        .toolbar-list > a {
          display: grid;
          grid-template-rows: auto;
          text-decoration: none;
          font-size: 22px;
          font-weight: bold;
          padding: 8px;
        }

        .toolbar-list > a[selected] {
          background-color: #7413dc23;
        }

        .toolbar-list > a:hover {
          background-color: #7413dc0c;
        }
        .menu-btn,
        .btn {
          background: none;
          border: none;
          fill: white;
          cursor: pointer;
          height: 44px;
          width: 44px;
        }

        /* Workaround for IE11 displaying <main> as inline */
        main {
          display: block;
          margin-top: 0px;
          margin-bottom: 0px;
          padding: 0px;
        }

        .page {
          display: none;
        }

        .page[active] {
          display: block;
        }

        .img-menu {
          display: block;
          max-width: 200px;
          max-height: 20px;
          width: auto;
          height: auto;
        }

        .img-welcome {
          display: inline;
          max-width: 200px;
          max-height: 30px;
        }
      `,
    ];
  }

  protected render() {
    // Anything that's related to rendering should be done in here.
    return html`
      <mwc-drawer hasHeader type="dismissible" .open="${this._drawerOpened}">
        <span slot="title"
          ><img
            class="img-welcome"
            src="../../images/welcome.png"
            alt="Menu"
          />Menu</span
        >
        <div>
          <nav class="toolbar-list">
            <a ?selected="${this._page === 'welcome'}" href="/#welcome"
              >Welcome</a
            >
            ${this._loggedIn === true
              ? html`
                  <a ?selected="${this._page === 'todo'}" href="/#todo">ToDo</a>
                  <a
                    ?selected="${this._page === 'postBoxView'}"
                    href="/#postBoxView"
                    >Where to purchase stamps and post</a
                  >
                  <a
                    ?selected="${this._page === 'editPostBoxView'}"
                    href="/#editPostBoxView"
                    >Edit purchase stamps and post</a
                  >
                  <a
                    ?selected="${this._page === 'groupAdmin'}"
                    href="/#groupAdmin"
                  >
                    ${this._admin ? html`Group admin` : html`Round admin`}
                  </a>
                  <a
                    ?selected="${this._page === 'assignStreets'}"
                    href="/#assignStreets"
                  >
                    ${this._admin ? html`Assign streets` : html`Assign rounds`}
                  </a>

                  <a ?selected="${this._page === 'rounds'}" href="/#rounds"
                    >Rounds</a
                  >
                  <a
                    ?selected="${this._page === 'sortBoxAdmin'}"
                    href="/#sortBoxAdmin"
                    >Sort box admin</a
                  >
                  <a
                    ?selected="${this._page === 'assignSortBox'}"
                    href="/#assignSortBox"
                    >Assign sort box</a
                  >
                  <a
                    ?selected="${this._page === 'sortBoxes'}"
                    href="/#sortBoxes"
                    >Sort boxes</a
                  >
                  <a
                    ?selected="${this._page === 'whereWeDeliverEdit'}"
                    href="/#whereWeDeliverEdit"
                    >Edit map</a
                  >
                `
              : html``}
          </nav>
        </div>
        <!-- Header -->
        <div slot="appContent">
          <mwc-top-app-bar centerTitle>
            <div slot="title">${this.appTitle}</div>
            <mwc-button
              title="Menu"
              class="btn"
              slot="navigationIcon"
              @click="${this._menuButtonClicked}"
              >${menuIcon}</mwc-button
            >
            <mwc-button
              class="btn"
              title="Logout"
              slot="actionItems"
              @click="${_logOutButtonClicked}"
              >${logOutIcon}</mwc-button
            >
            <mwc-button
              class="btn"
              title="Back"
              slot="actionItems"
              @click="${_BackButtonClicked}"
              >${arrowBackIcon}</mwc-button
            >
          </mwc-top-app-bar>
          <div>
            <main id="track" role="main">
              <welcome-page
                class="page"
                ?active="${this._page === 'welcome'}"
              ></welcome-page>
              <user-login
                class="page"
                ?active="${this._page === 'userLogin'}"
                .loggedIn="${this._loggedIn}"
              ></user-login>
              ${this._loggedIn === true
                ? html`
                    <todo-list
                      class="page"
                      ?active="${this._page === 'todo'}"
                    ></todo-list>
                    <postbox-view
                      class="page"
                      ?active="${this._page === 'postBoxView'}"
                    ></postbox-view>
                    <edit-postbox-view
                      class="page"
                      ?active="${this._page === 'editPostBoxView'}"
                    ></edit-postbox-view>
                    <group-admin
                      class="page"
                      ?active="${this._page === 'groupAdmin'}"
                    ></group-admin>
                    <round-boxes
                      class="page"
                      ?active="${this._page === 'rounds'}"
                    ></round-boxes>
                    <assign-streets
                      class="page"
                      ?active="${this._page === 'assignStreets'}"
                    ></assign-streets>
                    <sortbox-admin
                      class="page"
                      ?active="${this._page === 'sortBoxAdmin'}"
                    ></sortbox-admin>
                    <assign-sortbox
                      class="page"
                      ?active="${this._page === 'assignSortBox'}"
                    ></assign-sortbox>
                    <sort-boxes
                      class="page"
                      ?active="${this._page === 'sortBoxes'}"
                    ></sort-boxes>
                  `
                : html``}
              <my-view404
                class="page"
                ?active="${this._page === 'view404'}"
              ></my-view404>
            </main>
          </div>
        </div>
      </mwc-drawer>
      <snack-bar ?active="${this._snackbarOpened}">
        ${this._message}.
      </snack-bar>
      <pwa-install></pwa-install>
      <pwa-update
        offlineToastDuration="0"
        swpath="pwabuilder-sw.js"
      ></pwa-update>
    `;
  }

  constructor() {
    super();
    // To force all event listeners for gestures to be passive.
    // See https://www.polymer-project.org/3.0/docs/devguide/settings#setting-passive-touch-gestures
    setPassiveTouchGestures(true);
  }

  protected firstUpdated() {
    installRouter(location =>
      store.dispatch(navigate(decodeURIComponent(location.href)))
    );
    installOfflineWatcher(offline => store.dispatch(updateOffline(offline)));
    installMediaQueryWatcher(`(min-width: 460px)`, () =>
      store.dispatch(updateDrawerState(false))
    );
    logUserIn();
    this.track.addEventListener('touchstart', this.handleStart, false);
    this.track.addEventListener('touchend', this.handleEnd, false);
  }

  private _menuButtonClicked() {
    store.dispatch(updateDrawerState(!this._drawerOpened));
  }

  stateChanged(state: RootState) {
    this._page = state.app!.page;
    this._message = state.app!.message;

    this._offline = state.app!.offline;
    this._snackbarOpened = state.app!.snackbarOpened;
    this._drawerOpened = state.app!.drawerOpened;
    this.appTitle = getTitle(this._page);

    const usersState = userDataSelector(state);
    if (usersState) {
      this._admin = usersState._newUser.claims.administrator;
      this._member = usersState._newUser.claims.member;
      this._groupId = usersState._newUser.claims.group;
      this._displayName = usersState._newUser.displayName
        ? usersState._newUser.displayName
        : '';
      this._loggedIn = this._admin || this._member;
    }
  }

  handleStart(e: TouchEvent) {
    this.startX = e.changedTouches[0].pageX;
    this.startY = e.changedTouches[0].pageY;

    return true;
  }

  handleEnd(e: TouchEvent) {
    const deltaX = e.changedTouches[0].pageX - this.startX;
    const deltaY = Math.abs(e.changedTouches[0].pageY - this.startY);
    if (deltaX > 100 && deltaY < 100) {
      window.history.back();
    } else if (deltaX < -100 && deltaY < 100) {
      window.history.forward();
    }
  }
}
