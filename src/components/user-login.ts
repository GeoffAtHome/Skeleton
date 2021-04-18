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
  query,
  PropertyValues,
} from 'lit-element';

// These are the shared styles needed by this element.
import { connect } from 'pwa-helpers/connect-mixin';
import { PageViewElement } from './page-view-element';
import 'pouchdb-authentication/dist/pouchdb.authentication';

// This element is connected to the Redux store.
import { store, RootState } from '../store';

// These are the actions needed by this element.
import '@material/mwc-dialog';
import '@material/mwc-textfield';
import '@material/mwc-button';

import { SharedStyles } from './shared-styles';

import userData, { userDataSelector } from '../reducers/users';

import { UsersItem, userDataSelectUser } from '../actions/users';
import { navigate, notifyMessage } from '../actions/app';
// We are lazy loading its reducer.
if (userDataSelector(store.getState()) === undefined) {
  store.addReducers({
    userData,
  });
}

const url = 'https://scoutpostadmin.soord.org.uk:6984/_users';
const MEMBER_ROLE = 'scoutpostmember';
const ADMIN_ROLE = 'scoutpostadministrator';

// eslint-disable-next-line no-undef
const usersDB: any = new PouchDB(url);

function LogError(text: string, err: any) {
  console.log(`${text}: ${err}`);
}

function switchToHome() {
  const newLocation = `/`;
  window.history.pushState({}, '', newLocation);
  store.dispatch(navigate(decodeURIComponent(newLocation)));
}
export async function logUserIn() {
  try {
    const session = await usersDB.getSession();
    if (
      session.userCtx.roles!.includes(ADMIN_ROLE) ||
      session.userCtx.roles!.includes(MEMBER_ROLE)
    ) {
      const admin = session.userCtx.roles.includes(ADMIN_ROLE);
      const scoutMember = session.userCtx.roles.includes(MEMBER_ROLE);
      let group = '';

      if (scoutMember) {
        const role: Array<string> = session.userCtx.roles.filter(
          (x: string) => {
            return x.startsWith('usergroup_');
          }
        );
        [, group] = role[0].split(' ');
      }

      const thisUser: UsersItem = {
        displayName: session.userCtx.name,
        email: session.userCtx.name,
        photoURL: '',
        claims: { administrator: admin, member: scoutMember, group },
      };

      switchToHome();
      store.dispatch(userDataSelectUser(thisUser));
    } else {
      const thisUser: UsersItem = {
        displayName: 'Login',
        email: 'Login',
        photoURL: '',
        claims: { administrator: false, member: false, group: '' },
      };
      store.dispatch(userDataSelectUser(thisUser));
      const newLocation = `/#userLogin`;
      window.history.pushState({}, '', newLocation);
      store.dispatch(navigate(decodeURIComponent(newLocation)));
    }
  } catch (err) {
    if (err === undefined || err.code === 'ETIMEDOUT' || err.status === 0) {
      const thisUser: UsersItem = {
        displayName: 'Login',
        email: 'Login',
        photoURL: '',
        claims: { administrator: false, member: false, group: '' },
      };
      store.dispatch(userDataSelectUser(thisUser));
      const newLocation = `/#userLogin`;
      window.history.pushState({}, '', newLocation);
      store.dispatch(navigate(decodeURIComponent(newLocation)));
    } else {
      LogError('logUserIn', err);
    }
  }
}

@customElement('user-login')
export class UserLogin extends connect(store)(PageViewElement) {
  @query('#loginDialog')
  private loginDialog: any;

  @query('#changePasswordDialog')
  private changePasswordDialog: any;

  @query('#logoutDialog')
  private logoutDialog: any;

  @query('#current-password')
  private password: any;

  @query('#toggle-password')
  private togglePasswordButton: any;

  @query('#oldPassword')
  private oldPassword: any;

  @query('#newPassword')
  private newPassword: any;

  @query('#confirmPassword')
  private confirmPassword: any;

  @query('#username')
  private emailAddress: any;

  @property({ type: String })
  private errorCode: string | null = '';

  @property({ type: String })
  private errorMessage: string | null = '';

  @property({ type: String })
  private username: string = '';

  @property({ type: String })
  private passwordPassword: string = '';

  @property({ type: Boolean })
  private loggedIn: boolean = false;

  static get styles() {
    return [
      SharedStyles,
      css`
        :host {
          display: block;
        }

        input {
          border: 1px solid #ccc;
          font-size: 22px; /* fallback */
          font-size: var(--mobile-font-size);
          padding: 15px;
          width: 90%; /* fallback */
          width: calc(100% - 30px); /* full width minus padding */
        }

        input[type='text']:not(:focus):invalid,
        input[type='password']:not(:focus):invalid {
          color: red;
          outline-color: red;
        }

        label {
          display: block;
          font-size: 20px;
          font-size: var(--mobile-font-size);
          font-weight: 500;
          margin: 0 0 3px 0;
        }

        form section {
          margin: 0 0 20px 0;
          position: relative; /* for password toggle positioning */
        }

        button#toggle-password {
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 300;
          padding: 0;
          position: absolute;
          top: 26px;
          right: 30px;
        }

        @media (min-width: 450px) {
          body {
            margin: 50px;
          }
          button {
            font-size: 14px; /* fallback */
            font-size: var(--desktop-font-size);
          }
          h1 {
            font-size: 28px;
            font-size: calc(2 * var(--desktop-font-size));
            font-weight: 500;
            margin: 0 0 80px 0;
          }
          input {
            font-size: 14px; /* fallback */
            font-size: var(--desktop-font-size);
          }
          label {
            font-size: 14px; /* fallback */
            font-size: var(--desktop-font-size);
          }
        }
      `,
    ];
  }

  protected render() {
    return html`
      <mwc-dialog id="loginDialog" heading="Sign in">
        <section>
          <label for="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            autocomplete="username"
            required
          />
        </section>

        <section>
          <label for="current-password">Password</label>
          <input
            id="current-password"
            name="current-password"
            type="password"
            autocomplete="current-password"
            minlength="8"
            required
          />
          <button
            id="toggle-password"
            aria-label="Show password as plain text. Warning: this will display your password on the screen."
            @click="${this.togglePassword}"
          >
            Show password
          </button>
        </section>
        ${this.errorCode !== ''
          ? html` <div>
              <h3>Error code: ${this.errorCode}</h3>
              <h3>Error message: ${this.errorMessage}</h3>
            </div>`
          : html``}
        <button id="sign-in" type="submit" @click="${this.loginButton}">
          Sign in
        </button>
      </mwc-dialog>
      <mwc-dialog
        id="logoutDialog"
        heading="Logout"
        @closed="${this.dialogClick}"
      >
        <div>
          <mwc-button slot="primaryAction" dialogAction="cancel"
            >Cancel</mwc-button
          >
          <mwc-button slot="secondaryAction" dialogAction="change"
            >Change password</mwc-button
          >
          <mwc-button slot="secondaryAction" dialogAction="logout"
            >Logout</mwc-button
          >
        </div>
      </mwc-dialog>
      <mwc-dialog
        id="changePasswordDialog"
        heading="Change password"
        @closed="${this.dialogClick}"
      >
        <div>
          <div>
            <mwc-textfield
              required
              autocomplete
              name="password"
              type="password"
              id="oldPassword"
              validationMessage="Password required"
              label="Old password"
            ></mwc-textfield>
          </div>
          <div>
            <mwc-textfield
              required
              autocomplete
              name="password"
              type="password"
              id="newPassword"
              validationMessage="Password required"
              label="New password"
            ></mwc-textfield>
          </div>
          <div>
            <mwc-textfield
              required
              autocomplete
              name="password"
              type="password"
              id="confirmPassword"
              validationMessage="Password required"
              label="Confirm password"
            ></mwc-textfield>
          </div>
          <mwc-button slot="primaryAction" dialogAction="cancel"
            >Cancel</mwc-button
          >
          <mwc-button slot="secondaryAction" @click="${this.changePassword}"
            >Change password</mwc-button
          >
          ${this.errorCode !== ''
            ? html` <div>
                <h3>Error message: ${this.errorMessage}</h3>
              </div>`
            : html``}
        </div>
      </mwc-dialog>
    `;
  }

  updated(_changedProps: PropertyValues) {
    if (this.loggedIn) {
      if (this.loginDialog !== null && this.loginDialog.open) {
        this.loginDialog.close();
      }
      if (!this.logoutDialog.open) {
        this.logoutDialog.show();
      }
    } else {
      if (this.logoutDialog !== null && this.logoutDialog.open) {
        this.logoutDialog.close();
      }
      if (
        !this.loginDialog.open &&
        (_changedProps.has('loggedIn') || _changedProps.has('active'))
      ) {
        this.loginDialog.show();
      }
    }
  }

  private togglePassword() {
    if (this.password.type === 'password') {
      this.password.type = 'text';
      this.togglePasswordButton.textContent = 'Hide password';
      this.togglePasswordButton.setAttribute('aria-label', 'Hide password.');
    } else {
      this.password.type = 'password';
      this.togglePasswordButton.textContent = 'Show password';
      this.togglePasswordButton.setAttribute(
        'aria-label',
        'Show password as plain text. ' +
          'Warning: this will display your password on the screen.'
      );
    }
  }

  private async loginButton(_el: any) {
    this.username = this.emailAddress.value.toString().trimStart().trimEnd();
    this.passwordPassword = this.password.value
      .toString()
      .trimStart()
      .trimEnd();
    try {
      await usersDB.logIn(this.username, this.passwordPassword);
      this.errorCode = '';
      this.errorMessage = '';
      if (this.loginDialog.open) {
        this.loginDialog.close();
      }
      if (this.changePasswordDialog.open) {
        this.changePasswordDialog.close();
      }
      logUserIn();
    } catch (err) {
      LogError('loginButton', err);
      this.errorCode = err.status;
      this.errorMessage = err.message;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  stateChanged(_state: RootState) {}

  private dialogClick(_el: any) {
    if (_el.detail !== null) {
      switch (_el.detail.action) {
        case 'logout':
          return this.logout();

        case 'change':
          if (!this.changePasswordDialog.open) {
            return this.changePasswordDialog.show();
          }
          break;

        case 'changePassword':
          return this.changePassword();

        default:
          return switchToHome();
      }
    }
    return true;
  }

  private async changePassword() {
    // Reset error
    this.errorCode = '0';
    this.errorMessage = '';

    // Check is old password is valid
    const oldPassword = this.oldPassword.value.toString().trimStart().trimEnd();
    if (oldPassword !== this.passwordPassword) {
      this.errorCode = '1';
      this.errorMessage = 'Old password does not match current password';
    }

    // Change confirmation password
    const newPassword = this.newPassword.value.toString().trimStart().trimEnd();
    const confirmPassword = this.confirmPassword.value
      .toString()
      .trimStart()
      .trimEnd();
    if (newPassword.length < 8) {
      this.errorCode = '2';
      this.errorMessage = 'Password must be greater than 8 characters';
    }
    if (newPassword !== confirmPassword) {
      this.errorCode = '3';
      this.errorMessage = 'New password does not match confirmed password';
    }
    // We are now ready to change the password
    if (this.errorCode === '0') {
      try {
        await usersDB.getUser(this.username);
        await usersDB.changePassword(this.username, newPassword);
        this.passwordPassword = newPassword;
        store.dispatch(notifyMessage('Password changed'));
      } catch (err) {
        LogError('changePassword', err);
        this.errorCode = err.status;
        this.errorMessage = err.message;
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private async logout() {
    try {
      const result = await usersDB.logOut();
      if (result.ok) {
        const thisUser: UsersItem = {
          displayName: 'Login',
          email: 'Login',
          photoURL: '',
          claims: { administrator: false, member: false, group: '' },
        };
        store.dispatch(userDataSelectUser(thisUser));
      }
    } catch (err) {
      LogError('logout', err);
    }
  }
}
