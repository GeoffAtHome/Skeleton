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
  internalProperty,
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

// This element is connected to the Redux store.
import { store, RootState } from '../store';

// These are the actions needed by this element.
import {
  groupDataAddGroup,
  groupDataDeleteGroup,
  groupDataUpdateGroup,
  GroupData,
  GroupDataItem,
  groupDataLoad,
} from '../actions/groupdata';

// We are lazy loading its reducer.
import groupData, { groupdataSelector } from '../reducers/groupdata';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';

import { labelIcon } from './my-icons';
import { notifyMessage } from '../actions/app';
import { userDataSelector } from '../reducers/users';

if (groupdataSelector(store.getState()) === undefined) {
  store.addReducers({ groupData });
}

@customElement('group-admin')
export class GroupAdmin extends connect(store)(PageViewElement) {
  @query('#editGroup')
  private dialog: any;

  @query('#addUpdate')
  private addUpdate: any;

  @property({ type: String })
  private groupId: string = '';

  @property({ type: Boolean })
  private admin = false;

  @property({ type: Object })
  private newGroup: GroupDataItem = {
    _id: '',
    name: '',
    notes: '',
    contactDetails: '',
    colour: '',
  };

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
  private _id = '';

  @internalProperty()
  private groupData: GroupData = {};

  static get styles() {
    return [
      SharedStyles,
      css`
        :host {
          display: flex;
          align-items: flex-start;
          height: 100%;
        }

        #grid {
          height: 82vh;
        }

        #addGroup {
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
      <mwc-dialog id="editGroup" heading="Group">
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
      <mwc-button id="addGroup" raised @click="${this.addGroup}"
        >${labelIcon}</mwc-button
      >

      <vaadin-grid
        id="grid"
        theme="row-dividers"
        column-reordering-allowed
        multi-sort
        aria-label="Groups"
        .items="${Object.entries(this.groupData)
          .sort(([a], [b]) => {
            return Number(a) - Number(b);
          })
          .map(([k, x]) => {
            const item = x;
            item._id = k;
            return item;
          })}"
        @click="${this._groupSelected}"
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

  stateChanged(state: RootState) {
    if(this.active) {
      const groupDataState = groupdataSelector(state);
      this.groupData = { ...groupDataState!._groupData };

      const usersState = userDataSelector(state);
      if (usersState) {
        if (
          this.admin !== usersState._newUser.claims.administrator ||
          this.groupId !== usersState._newUser.claims.group
        ) {
          this.admin = usersState._newUser.claims.administrator;
          this.groupId = usersState._newUser.claims.group;
          if (!(this.admin === false && this.groupId === ''))
            store.dispatch(groupDataLoad(this.admin, this.groupId));
        }
      }
    }
  }

  _groupSelected(_el: Event) {
    if (this.grid.activeItem._id !== undefined) {
      this.newGroup = this.grid.activeItem;
      if (Number(this.newGroup._id) !== 0) {
        this.grid.activeItem = {};
        this.addUpdate.textContent = 'Update';
        this.editID.setAttribute('readonly', '');
        this.showEditLabelDialog('Update', this.newGroup);
      } else {
        store.dispatch(
          notifyMessage('ID zero is reserved and cannot be modified.')
        );
      }
    }
  }

  private addGroup(_el: Event) {
    this.newGroup = {
      _id: '',
      name: '',
      notes: '',
      contactDetails: '',
      colour: '#00ff00',
    };
    this.addUpdate.textContent = 'Add';
    this.editID.removeAttribute('readonly');
    this.showEditLabelDialog('Add', this.newGroup);
  }

  private close(_el: any) {
    return this.dialog.close();
  }

  private getItems() {
    Object.entries(this.groupData)
      .sort(([a], [b]) => {
        return Number(a) - Number(b);
      })
      .map(([k, x]) => {
        const item = x;
        item._id = k;
        return item;
      });
  }

  private showEditLabelDialog(title: string, groupItem: GroupDataItem) {
    let fullTitle = '';
    if (this.groupId === '') {
      fullTitle = `${title} Group`;
    } else {
      fullTitle = `${title} Round`;
    }
    this.dialog.setAttribute('heading', fullTitle);
    this.editID.value = groupItem._id;
    this.editName.value = groupItem.name;

    this.editColour.value = groupItem.colour;

    this.editNotes.value = groupItem.notes;
    this.editContactDetails.value = groupItem.contactDetails;
    this._id = groupItem._id;
    this.dialog.show();
  }

  private checkIfAlreadyAdded(id: string) {
    const result = this.groupData[id];
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
        this.newGroup._id = this.editID.value;
        this.newGroup.name = this.editName.value;
        this.newGroup.colour = this.editColour.value;
        this.newGroup.notes = this.editNotes.value;
        this.newGroup.contactDetails = this.editContactDetails.value;
        this.dialog.close();

        if (this.addUpdate.textContent === 'Add') {
          store.dispatch(groupDataAddGroup(this.newGroup));
        } else {
          store.dispatch(groupDataUpdateGroup(this.newGroup));
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
    store.dispatch(groupDataDeleteGroup(this.newGroup));
  }
}
