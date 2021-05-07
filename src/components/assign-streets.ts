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
  query,
  property,
  PropertyValues,
} from 'lit-element';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';
// import '@material/mwc-textfield-css';
// IMPORTANT: USE WEBPACK RAW-LOADER OR EQUIVALENT

import { PageViewElement } from './page-view-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { getTextColor } from './getTextColour';
import { compareGroup } from './sorting';

// This element is connected to the Redux store.
import { store, RootState } from '../store';

// These are the actions needed by this element.
import {
  GroupDataItem,
  groupDataSelectGroup,
  GroupData,
  GroupFilter,
  groupDataLoad,
} from '../actions/groupdata';
import { PolygonData, polygonDataLoad } from '../actions/polygondata';

import { pathEditIcon } from './my-icons';

// We are lazy loading its reducer.
import groupdata, { groupDataSelector } from '../reducers/groupdata';
import { streetMapSelector } from '../reducers/streetmap';
import polygonData, { polygonDataSelector } from '../reducers/polygondata';
import assignedData, { assignedDataSelector } from '../reducers/assignedData';
import userData, { userDataSelector } from '../reducers/users';
import { streetInfoLoad } from '../actions/streetInfo';

if (groupDataSelector(store.getState()) === undefined) {
  store.addReducers({
    groupdata,
  });
}
if(polygonDataSelector(store.getState()) === undefined) {
  store.addReducers({polygonData,});
}
if(assignedDataSelector(store.getState()) === undefined) {
  store.addReducers({assignedData,});
}
if(userDataSelector(store.getState()) === undefined) {
  store.addReducers({userData,});
}

// These are the elements needed by this element.
import '@material/mwc-dialog';
import '@material/mwc-textfield';
import '@material/mwc-checkbox';
import '@material/mwc-formfield';
import '@material/mwc-select';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-button';

import './assign-streets-view';
import { PublicStreet } from '../actions/publicstreet';
import { StreetInfoData } from '../actions/streetmap';
import { AssignedData, assignedDataLoad } from '../actions/assignedData';
import { Polygon } from './polygons';

let LAssignedData: AssignedData = {};

@customElement('assign-streets')
export class AssignStreets extends connect(store)(PageViewElement) {
  @query('#selectGroupDialog')
  private selectGroupDialog: any;

  @query('#selectGroup')
  private selectGroup: any;

  @query('#checkedAll')
  private checkedAll: any;

  @property({ type: Array })
  private data: Array<PublicStreet> = [];

  @property({ type: Boolean, reflect: true })
  private drawOpened: boolean = false;

  @property({ type: String })
  private changedIndex: string = '';

  @property({ type: Object })
  private polygon: Polygon = { type: 'Polygon', coordinates: [] };

  @property({ type: Object })
  private groupData: GroupData = {};

  @property({ type: Object })
  private streetInfoData: StreetInfoData = {};

  @property({ type: Object, attribute: true })
  private groupFilter: GroupFilter = {};

  @property({ type: Object, attribute: true })
  private oldGroupFilter: GroupFilter = {};

  @property({ type: Object })
  private polygonData: PolygonData = {};

  @property({ type: Boolean })
  private admin: boolean | undefined = undefined;

  @property({ type: String })
  private groupId = ''

  @property({ type: Object })
  private selectedGroup: GroupDataItem = {
    _id: '',
    name: '',
    notes: '',
    contactDetails: '',
    colour: '',
  };

  static get styles() {
    return [
      SharedStyles,
      css`
        :host {
          display: flex;
          align-items: flex-start;
          height: 100%;
        }

        assign-streets-view {
          width: 100%;
          height: 80vh;
        }

        .groupList {
          background-color: var(--cl);
          color: var(--tx);
        }

        #selectGroup {
          position: fixed;
          fill: white;
          bottom: 15px;
          right: 15px;
          z-index: 1;
        }

        #filter {
          position: fixed;
          fill: white;
          bottom: 15px;
          right: 240px;
          z-index: 1;
        }

        @media print {
          mwc-dialog,
          mwc-select,
          mwc-button {
            display: none !important;
          }
        }
      `,
    ];
  }

  protected render() {
    return html`
      <mwc-dialog
        id="selectGroupDialog"
        heading="Select groups to display"
        @closed="${this.closeFilterDialog}"
      >
        <div>
          <mwc-formfield label="All">
            <mwc-checkbox
              @click="${this.allChecked}"
              id="checkedAll"
            ></mwc-checkbox>
          </mwc-formfield>
        </div>
        ${Object.entries(this.groupData)
          .sort(this.compareGroup)
          .map(
            ([, item]) =>
              html`<div
                class="groupList"
                style="--cl: ${item.colour}; --tx: ${getTextColor(item.colour)}"
              >
                <mwc-formfield
                  style="--mdc-theme-text-primary-on-background: ${getTextColor(
                    item.colour
                  )}"
                  label="${item.name}"
                  ><mwc-checkbox
                    style="--mdc-checkbox-unchecked-color: ${getTextColor(
                      item.colour
                    )}"
                    id="ID${item._id}"
                    @click="${this.allChecked}"
                  ></mwc-checkbox
                ></mwc-formfield>
              </div>`
          )}
        <mwc-button slot="primaryAction" dialogAction="filter"
          >Filter</mwc-button
        >
        <mwc-button slot="secondaryAction" dialogAction="cancel"
          >Cancel</mwc-button
        >
      </mwc-dialog>
      <mwc-select
        id="selectGroup"
        label="Select Group"
        @selected="${this.groupSelected}"
      >
        ${Object.entries(this.groupData)
          .sort(this.compareGroup)
          .map(
            ([, item]) =>
              html`<mwc-list-item
                value="${item._id}"
                class="groupList"
                style="--cl: ${item.colour}; --tx: ${getTextColor(item.colour)}"
                >${item.name}</mwc-list-item
              >`
          )}
      </mwc-select>
      <mwc-button id="filter" raised @click="${this.showFilter}"
        >${pathEditIcon}</mwc-button
      >
      <assign-streets-view
        .groupData="${this.groupData}"
        .admin="${this.admin}"
        .changedIndex="${this.changedIndex}"
        .polygon="${this.polygon}"
        .groupFilter="${this.groupFilter}"
        .streetInfoData="${this.streetInfoData}"
        .assignedData="${LAssignedData}"
        .polygonData="${this.polygonData}"
        .data="${this.data}"
        .selectedGroup="${this.selectedGroup}"
      ></assign-streets-view>
    `;
  }

  protected firstUpdated(_changedProperties: any) {
  }

  updated(changedProps: PropertyValues) {
    if (changedProps.has('admin')) {
      let title = '';
      let select = '';
      if (this.admin) {
        title = 'Select groups to display';
        select = 'Select group';
      } else {
        title = 'Select rounds to display';
        select = 'Select round';
      }
      this.selectGroupDialog.setAttribute('heading', title);
      this.selectGroup.setAttribute('label', select);
    }
    if(changedProps.has('groupData')) {
      this.checkedAll.checked = true;
      this.filterAll(true);
      this.showFilter();
    }
  }

  stateChanged(state: RootState) {
    if (this.drawOpened !== state.app!.drawerOpened) {
      this.drawOpened = state.app!.drawerOpened;
      if (this.drawOpened) {
        if (this.selectGroup !== null) {
          this.selectGroup.setAttribute('drawOpened', '');
        }
      } else {
        if (this.selectGroup !== null) {
          this.selectGroup.removeAttribute('drawOpened');
        }
      }
    }

    if (state.app!.page === 'assignstreets') {
        const usersState = userDataSelector(state);
        if (usersState) {
          if (
            this.admin !== usersState._newUser.claims.administrator ||
            this.groupId !== usersState._newUser.claims.group
          ) {
            this.admin = usersState._newUser.claims.administrator;
            this.groupId = usersState._newUser.claims.group;
            if (!(this.admin === false && this.groupId === '')) {
              store.dispatch(groupDataLoad(this.admin, this.groupId));
            }
            // Load the data required for this page
            store.dispatch(polygonDataLoad());
            store.dispatch(assignedDataLoad());
            store.dispatch(streetInfoLoad());
          }
        }
  
      const groupDataState = groupDataSelector(state);
      if(groupDataState) {
        this.selectedGroup = groupDataState!._newGroup;
        this.groupData = groupDataState!._groupData;
      }

      const assignedDataState = assignedDataSelector(state);
      LAssignedData = assignedDataState!._assignedData;

      const polygonDataState = polygonDataSelector(state);
      if (polygonDataState) this.polygonData = polygonDataState!._polygonData;

      const streetMapState = streetMapSelector(state);
      if(streetMapState) this.streetInfoData = streetMapState!._streetInfo;
    }
  }

  private compareGroup(
    [, left]: [string, GroupDataItem],
    [, right]: [string, GroupDataItem]
  ) {
    return compareGroup(left.name, right.name);
  }

  private showFilter() {
    this.selectGroupDialog.show();
  }

  private allChecked(_el: any) {
    const state = _el.target.checked;
    if (_el.target.id === 'checkedAll') {
      this.filterAll(!state);
    } else {
      const id = _el.target.id.split('ID')[1];
      this.oldGroupFilter[id] = !state;
      this.checkedAll.checked = this.areAllChecked();
    }
  }

  private areAllChecked() {
    let result = true;
    for (const [_id, entry] of Object.entries(this.oldGroupFilter)) {
      if (entry === false) {
        result = false;
      }
    }
    return result;
  }

  private filterAll(state: boolean) {
    Object.entries(this.groupData).map(([_key, item]) => {
      const checkbox: any = this.shadowRoot!.querySelector('#ID' + item._id);
      checkbox.checked = state;
      this.oldGroupFilter[item._id] = state;
    });
  }

  private groupSelected(evt: any) {
    this.selectedGroup = this.groupData[evt.target.value];
    this.selectGroupDialog.close();
    store.dispatch(groupDataSelectGroup(this.selectedGroup));
  }

  private updateFilter() {
    let update = false;
    Object.entries(this.oldGroupFilter).map(([oldItem, newItem]) => {
      if (this.groupFilter[oldItem] !== newItem) {
        update = true;
      }
    });

    if (update) {
      this.groupFilter = { ...this.oldGroupFilter };
    }
  }

  private closeFilterDialog(_el: any) {
    if (_el.detail !== null) {
      switch (_el.detail.action) {
        case 'filter':
          this.updateFilter();
          return;

        default:
          return;
      }
    }
  }
}
