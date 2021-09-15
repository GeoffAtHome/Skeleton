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
  property,
  query,
  customElement,
  css,
  PropertyValues,
} from 'lit-element';

// These are the elements needed by this element.
import { connect } from 'pwa-helpers/connect-mixin';
import { PageViewElement } from './page-view-element';
import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import '@material/mwc-dialog';
import '@material/mwc-textfield';
import '@material/mwc-button';
import '@material/mwc-select';
import '@material/mwc-list/mwc-list-item';
import './loading-spinner';

import { labelIcon } from './my-icons';

// This element is connected to the Redux store.
import { store, RootState } from '../store';

import {
  SortboxItem,
  sortboxUpdate,
  sortboxAdd,
  SortboxList,
  sortboxLoad,
  sortboxDelete,
} from '../actions/sortboxes';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';
import { notifyMessage } from '../actions/app';
import { userDataSelector } from '../reducers/users';
import sortboxList, { sortboxListSelector } from '../reducers/sortboxes';
import syncState, { syncStateSelector } from '../reducers/syncState';
import { sortBoxesURL } from '../reducers/dbconst';
import { fullyLoaded } from '../actions/syncState';

if (sortboxListSelector(store.getState()) === undefined) {
  store.addReducers({ sortboxList });
}
if (syncStateSelector(store.getState()) === undefined) {
  store.addReducers({ syncState });
}

const publicDB: Array<string> = [];
const userDB: Array<string> = [sortBoxesURL];

@customElement('sortbox-admin')
export class SortboxAdmin extends connect(store)(PageViewElement) {
  @query('#editSortBox')
  private dialog: any;

  @query('#addUpdate')
  private addUpdate: any;

  @property({ type: Object })
  private newSortbox: SortboxItem = {
    _id: '',
    name: '',
    notes: '',
    contactDetails: '',
    colour: '',
  };

  @property({ type: Object })
  private sortboxList: SortboxList = {};

  @query('#id')
  private editID: any;

  @query('#name')
  private editName: any;

  @query('#colour')
  private editColour: any;

  @query('#notes')
  private editNotes: any;

  @query('#contactDetails')
  private editContactDetails: any;

  @query('#grid')
  private grid: any;

  @property({ type: String })
  private _page = '';

  @property({ type: String })
  private _id = '';

  @property({ type: Boolean })
  private admin: boolean = true;

  @property({ type: Boolean })
  private _loading = true;

  @property({ type: String })
  private groupId = '';

  @property({ type: String })
  private sortboxLoading = '';

  static get styles() {
    return [
      SharedStyles,
      css`
        :host {
          display: flex;
          align-items: flex-start;
          height: 100%;
        }

        #addSortBox {
          position: absolute;
          fill: white;
          bottom: 15px;
          right: 15px;
          z-index: 1;
        }

        .showButton {
          display: inherit;
        }

        .showButton[active] {
          display: none;
        }

        mwc-textfield {
          width: 300px;
        }
      `,
    ];
  }

  protected render() {
    return html`
      <loading-spinner ?loading="${this._loading}"></loading-spinner>
      <mwc-dialog id="editSortBox" heading="Sort boxes">
        <div>
          <div>
            <mwc-textfield
              id="id"
              dialogInitialFocus
              type="number"
              autoValidate
              min="1"
              max="999"
              maxlength="3"
              pattern="[0-9][0-9][0-9]"
              validationMessage="Value needs to be between 1 and 999"
              required
              label="ID"
            ></mwc-textfield>
          </div>
          <div>
            <mwc-textfield
              id="name"
              type="text"
              label="Name"
              validationMessage="A name is required"
              required
              minlength="1"
            ></mwc-textfield>
          </div>
          <div>
            <mwc-textfield
              id="colour"
              type="color"
              label="Colour"
              required
            ></mwc-textfield>
          </div>
          <div>
            <mwc-textfield id="notes" label="Notes"></mwc-textfield>
          </div>
          <div>
            <mwc-textfield
              id="contactDetails"
              label="Contact details"
            ></mwc-textfield>
          </div>
          <div class="showButton" ?active="${this._id === ''}">
            <mwc-button @click="${this.deleteLabel}">delete</mwc-button>
          </div>
        </div>
        <mwc-button
          id="addUpdate"
          slot="secondaryAction"
          @click="${this.updateLabel}"
          >Update</mwc-button
        >
        <mwc-button slot="primaryAction" @click="${this.close}"
          >Close</mwc-button
        >
      </mwc-dialog>
      <mwc-button id="addSortBox" raised @click="${this.addSortbox}"
        >${labelIcon}</mwc-button
      >

      <vaadin-grid
        id="grid"
        theme="row-dividers"
        column-reordering-allowed
        multi-sort
        aria-label="sort boxes"
        .items="${Object.entries(this.sortboxList)
          .sort(([a], [b]) => {
            return Number(a) - Number(b);
          })
          .map(([k, x]) => {
            const item = x;
            item._id = k;
            return item;
          })}"
        @click="${this._sortboxSelected}"
        active-item="[[activeItem]]"
      >
        <vaadin-grid-filter-column
          width="60px"
          flex-grow="0"
          header="ID"
          path="_id"
        ></vaadin-grid-filter-column>
        <vaadin-grid-column
          width="80px"
          flex-grow="0"
          header="Colour"
          path="colour"
          ><template>
            <svg width="20" height="10">
              <rect
                width="60"
                height="60"
                style="fill:[[item.colour]];stroke-width:3;stroke:[[item.colour]]"
              />
            </svg>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-filter-column
          auto-width
          flex-grow="1"
          header="Name"
          path="name"
        ></vaadin-grid-filter-column>
        <vaadin-grid-filter-column
          auto-width
          flex-grow="1"
          header="Notes"
          path="notes"
        ></vaadin-grid-filter-column>
        <vaadin-grid-filter-column
          auto-width
          flex-grow="1"
          header="Contact details"
          path="contactDetails"
        ></vaadin-grid-filter-column>
      </vaadin-grid>
    `;
  }

  updated(changedProps: PropertyValues) {
    if (changedProps.has('admin') || changedProps.has('groupId')) {
      // Load the data required for this page
      store.dispatch(sortboxLoad(this.groupId));
    }
  }

  stateChanged(state: RootState) {
    this._page = state.app!.page;
    if (this._page === 'sortBoxAdmin') {
      const usersState = userDataSelector(state);
      this.admin = usersState!._newUser.claims.administrator;
      this.groupId = usersState!._newUser.claims.group;

      const _syncState = syncStateSelector(state);
      this._loading = fullyLoaded(
        publicDB,
        userDB,
        this.groupId,
        _syncState!._docs
      );

      const sortBoxesState = sortboxListSelector(state);
      this.sortboxList = sortBoxesState!._sortboxList;
    }
  }

  _sortboxSelected(_el: Event) {
    if (this.grid.activeItem._id !== undefined) {
      this.newSortbox = this.grid.activeItem;
      if (Number(this.newSortbox._id) !== 0) {
        this.grid.activeItem = {};
        this.addUpdate.textContent = 'Update';
        this.editID.setAttribute('readonly', '');
        this.showEditLabelDialog('Update', this.newSortbox);
      } else {
        store.dispatch(
          notifyMessage('ID zero is reserved and cannot be modified.')
        );
      }
    }
  }

  private addSortbox(_el: Event) {
    this.newSortbox = {
      _id: '',
      name: '',
      notes: '',
      contactDetails: '',
      colour: '#00ff00',
    };
    this.addUpdate.textContent = 'Add';
    this.editID.removeAttribute('readonly');
    this.showEditLabelDialog('Add', this.newSortbox);
  }

  private close(_el: any) {
    return this.dialog.close();
  }

  private showEditLabelDialog(title: string, sortboxItem: SortboxItem) {
    const fullTitle = `${title} Sortbox`;
    this.dialog.setAttribute('heading', fullTitle);
    this.editID.value = sortboxItem._id;
    this.editName.value = sortboxItem.name;

    this.editColour.value = sortboxItem.colour;

    this.editNotes.value = sortboxItem.notes;
    this.editContactDetails.value = sortboxItem.contactDetails;
    this._id = sortboxItem._id;
    this.dialog.show();
  }

  private checkIfAlreadyAdded(id: string) {
    const result = this.sortboxList[id];
    return result !== undefined;
  }

  private updateLabel() {
    this.editID.setCustomValidity('');
    if (this.editID.reportValidity() && this.editName.reportValidity()) {
      if (
        this.addUpdate.textContent === 'Update' ||
        (this.addUpdate.textContent === 'Add' &&
          !this.checkIfAlreadyAdded(this.editID.value))
      ) {
        this.newSortbox._id = this.editID.value;
        this.newSortbox.name = this.editName.value;
        this.newSortbox.colour = this.editColour.value;
        this.newSortbox.notes = this.editNotes.value;
        this.newSortbox.contactDetails = this.editContactDetails.value;
        this.dialog.close();

        this.sortboxList = {};
        if (this.addUpdate.textContent === 'Add') {
          store.dispatch(sortboxAdd(this.newSortbox));
        } else {
          store.dispatch(sortboxUpdate(this.newSortbox));
        }
      } else {
        // Let the user know this ID is already taken
        this.editID.isUiValid = false;
        this.editID.setCustomValidity('ID already inuse');
        this.editID.reportValidity();
      }
    }
  }

  private deleteLabel() {
    this.dialog.close();
    this.sortboxList = {};
    store.dispatch(sortboxDelete(this.newSortbox));
  }
}
