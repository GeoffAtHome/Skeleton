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
  internalProperty,
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
import { roundDataLoad, roundDataUpdateRound } from '../actions/roundsdata';
import { SortboxList, sortboxLoad } from '../actions/sortboxes';
import { sortDataLoad } from '../actions/sortData';

import { streetNames } from '../res/postcodeData';
import { pathEditIcon } from './my-icons';

// We are lazy loading its reducer.
import groupData, { groupDataSelector } from '../reducers/groupdata';
import { streetMapSelector } from '../reducers/streetmap';
import polygonData, { polygonDataSelector } from '../reducers/polygondata';
import assignedData, { assignedDataSelector } from '../reducers/assignedData';
import roundData, { roundDataSelector } from '../reducers/roundsdata';
import sortData, { sortDataSelector } from '../reducers/sortData';
import sortboxList, { sortboxListSelector } from '../reducers/sortboxes';
import userData, { userDataSelector } from '../reducers/users';

import { streetInfoLoad } from '../actions/streetInfo';

if (groupDataSelector(store.getState()) === undefined) {
  store.addReducers({
    groupData,
  });
}
if (sortDataSelector(store.getState()) === undefined) {
  store.addReducers({ sortData });
}
if (sortboxListSelector(store.getState()) === undefined) {
  store.addReducers({ sortboxList });
}
if (polygonDataSelector(store.getState()) === undefined) {
  store.addReducers({ polygonData });
}
if (assignedDataSelector(store.getState()) === undefined) {
  store.addReducers({ assignedData });
}
if (userDataSelector(store.getState()) === undefined) {
  store.addReducers({ userData });
}
if (roundDataSelector(store.getState()) === undefined) {
  store.addReducers({ roundData });
}

// These are the elements needed by this element.
import '@material/mwc-dialog';
import '@material/mwc-textfield';
import '@material/mwc-checkbox';
import '@material/mwc-formfield';
import '@material/mwc-select';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-button';
import './edit-map';
import { PublicStreet, PublicStreetData } from '../actions/publicstreet';
import { StreetInfoData } from '../actions/streetmap';
import {
  AssignedData,
  assignedDataLoad,
  assignedDataUpdateGroup,
} from '../actions/assignedData';
import { EditMapData, MapPolygon } from './polygons';
import { notifyMessage } from '../actions/app';

let LAssignedData: AssignedData = {};

let admin: boolean | undefined = undefined;

let selectedGroup: GroupDataItem = {
  _id: '',
  name: '',
  notes: '',
  contactDetails: '',
  colour: '',
};
@customElement('assign-streets')
export class AssignStreets extends connect(store)(PageViewElement) {
  @query('#selectGroupDialog')
  private selectGroupDialog: any;

  @query('#selectGroup')
  private selectGroup: any;

  @query('#checkedAll')
  private checkedAll: any;

  @query('#map')
  private map: any;

  @property({ type: Array })
  private data: Array<PublicStreet> = [];

  @property({ type: Boolean, reflect: true })
  private drawOpened: boolean = false;

  @property({ type: Boolean })
  private admin: boolean = true;

  @property({ type: Object })
  private groupData: GroupData = {};

  @property({ type: Object })
  private streetInfoData: StreetInfoData = {};

  @property({ type: Object, attribute: true })
  private groupFilter: GroupFilter = {};

  @property({ type: Object, attribute: true })
  private oldGroupFilter: GroupFilter = {};

  @property({ type: Object })
  private editMapData: EditMapData = {};

  @property({ type: Object })
  private polygonData: PolygonData = {};

  @property({ type: String })
  private groupId = '';

  @internalProperty()
  private _mapOptions = {
    center: { lat: 51.50502153288204, lng: -3.240311294225257 },
    zoom: 10,
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

        .groupList {
          background-color: var(--cl);
          color: var(--tx);
        }

        #selectGroup {
          position: fixed;
          fill: white;
          bottom: 23px;
          right: 60px;
          z-index: 1;
        }

        #filter {
          position: fixed;
          fill: white;
          bottom: 23px;
          right: 270px;
          z-index: 1;
        }

        #map {
          width: 100%;
          height: calc(100vh - 64px);
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
            ([_id, item]) =>
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
                    id="ID${_id}"
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
                class="groupList"
                style="--cl: ${item.colour}; --tx: ${getTextColor(item.colour)}"
                >${item.name}</mwc-list-item
              >`
          )}
      </mwc-select>
      <mwc-button id="filter" raised @click="${this.showFilter}"
        >${pathEditIcon}</mwc-button
      >
      <edit-map
        editMarkers
        id="map"
        .polygonData=${this.editMapData}
        .options=${this._mapOptions}
      ></edit-map>
    `;
  }

  protected firstUpdated(_changedProperties: any) {
    this.map.addEventListener('clickedPolygon', clickedPolygon);
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
    if (changedProps.has('groupData')) {
      this.checkedAll.checked = true;
      this.filterAll(true);
      this.showFilter();
    }
    if (changedProps.has('groupFilter')) {
      this.editMapData = MergePolygonData(
        this.polygonData,
        LAssignedData,
        this.groupFilter,
        this.groupData,
        this.streetInfoData,
        this.data
      );
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
          admin !== usersState._newUser.claims.administrator ||
          this.groupId !== usersState._newUser.claims.group
        ) {
          this.admin = usersState._newUser.claims.administrator;
          this.groupId = usersState._newUser.claims.group;
          admin = this.admin;

          if (!(this.admin === false && this.groupId === '')) {
            store.dispatch(notifyMessage('Loading: Group data'));
            store.dispatch(groupDataLoad(this.admin, this.groupId));
          } else {
            store.dispatch(notifyMessage('Loading: Round data'));
            store.dispatch(roundDataLoad(this.admin, this.groupId));
          }

          // Load the data required for this page
          if (admin === false && this.groupId !== '') {
            // assignedDataURL  | sortDataURL and sortBoxesURL
            store.dispatch(notifyMessage('Loading: Sort boxes'));
            store.dispatch(sortboxLoad(this.groupId));
            store.dispatch(notifyMessage('Loading: Sort data'));
            store.dispatch(sortDataLoad(this.groupId));
            store.dispatch(notifyMessage('Loading: assignment data'));
            store.dispatch(roundDataLoad());
            store.dispatch(notifyMessage('Loading: Rounds data'));
          }
          store.dispatch(notifyMessage('Loading: polygon data'));
          store.dispatch(polygonDataLoad());
          store.dispatch(notifyMessage('Loading: assignment data'));
          store.dispatch(assignedDataLoad());
          store.dispatch(notifyMessage('Loading: streetinfo'));
          store.dispatch(streetInfoLoad());
        }
      }

      const groupDataState = groupDataSelector(state);
      if (groupDataState) {
        selectedGroup = groupDataState!._newGroup;
        this.groupData = groupDataState!._groupData;
      }

      if (admin === false && this.groupId !== '') {
        const sortDataState = sortDataSelector(state);
        const sortData = sortDataState!._sortData;

        const sortBoxesState = sortboxListSelector(state);
        const sortBoxList = sortBoxesState!._sortboxList;

        const assignedDataState = assignedDataSelector(state);
        const assignedData = assignedDataState!._assignedData;

        const roundsDataState = roundDataSelector(state);
        const roundsData = roundsDataState!._roundData;

        LAssignedData = MergeData(
          this.groupId,
          roundsData,
          assignedData,
          sortBoxList
        );
      } else {
        const assignedDataState = assignedDataSelector(state);
        LAssignedData = assignedDataState!._assignedData;
      }

      const polygonDataState = polygonDataSelector(state);
      if (polygonDataState) {
        (this.polygonData = polygonDataState!._polygonData),
          (this.editMapData = MergePolygonData(
            this.polygonData,
            LAssignedData,
            this.groupFilter,
            this.groupData,
            this.streetInfoData,
            this.data
          ));
      }

      const streetMapState = streetMapSelector(state);
      if (streetMapState) this.streetInfoData = streetMapState!._streetInfo;
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
    Object.entries(this.groupData).map(([_id, item]) => {
      const checkbox: any = this.shadowRoot!.querySelector('#ID' + _id);
      checkbox.checked = state;
      this.oldGroupFilter[_id] = state;
    });
  }

  private groupSelected(evt: CustomEvent) {
    const list = Object.entries(this.groupData)
      .sort(this.compareGroup)
      .map(([id, item]) => {
        item._id = id;
        return item;
      });
    selectedGroup = list[evt.detail.index];
    this.selectGroupDialog.close();
    store.dispatch(groupDataSelectGroup(selectedGroup));
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

function MergePolygonData(
  polygonData: PolygonData,
  assignedData: AssignedData,
  groupFilter: GroupFilter,
  groupData: GroupData,
  streetInfoData: StreetInfoData,
  data: PublicStreet[]
): EditMapData {
  const results: EditMapData = {};

  if (assignedData !== {} && groupData !== {} && polygonData != {}) {
    for (const item of Object.entries(assignedData)) {
      const pc = item[0];
      if (assignedData[pc] !== undefined) {
        const groupKey = assignedData[pc].key;

        if (groupFilter[groupKey]) {
          const polygon = polygonData[pc];
          if (polygon !== undefined) {
            const pathX: MapPolygon = polygon.polygon;
            const groupDataItem = groupData[groupKey];
            const label = html`<p><b>${groupDataItem.name}</b></p>
              ${lookupPublicStreet(pc, streetNames)}${lookupStreetInfo(
                pc,
                streetInfoData
              )}`;

            const options = {
              paths: pathX,
              text: label,
              options: {
                strokeColor: groupDataItem.colour,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: groupDataItem.colour,
                fillOpacity: 0.35,
                editable: false,
              },
            };
            results[pc] = options;
          }
        }
      }
    }
  }
  return results;
}

function lookupPublicStreet(postcode: string, data: PublicStreetData) {
  return data[postcode].name;
}

function lookupStreetInfo(pc: string, streetInfoData: StreetInfoData) {
  let info = '';
  const streetInfo = streetInfoData[pc];
  if (streetInfo !== undefined) {
    info = `<br><b>First house: </b>${streetInfo.firstHouse}<br><b>Last house: </b>${streetInfo.lastHouse}<br><b>Number of properties: </b>${streetInfo.numberOfProperties}<br><b>Street order: </b>${streetInfo.streetOrder}`;
  }

  return info;
}

function clickedPolygon(el: CustomEvent) {
  if (selectedGroup._id !== '') {
    const { detail } = el;
    /* target.setStyle({ color: this.selectedGroup.colour });

    // Change the tooltip
    const parts = target.getTooltip().getContent().split(':');
    target.setTooltipContent(`${this.selectedGroup.name}: ${parts[1]}`);

    // Update group and street
    const layer = target.getLayers()[0];
    const key = layer.feature.id; */
    if (admin) {
      store.dispatch(
        assignedDataUpdateGroup(detail, { key: selectedGroup._id.toString() })
      );
    } else {
      store.dispatch(
        roundDataUpdateRound(
          detail,
          {
            key: selectedGroup._id.toString(),
          },
          LAssignedData[detail].key
        )
      );
    }
  } else {
    store.dispatch(notifyMessage('Select round to assign'));
  }
}

function MergeData(
  groupId: string,
  roundsData: AssignedData,
  assignedData: AssignedData,
  sortData: SortboxList
) {
  const results: AssignedData = {};
  for (const [pc, assigned] of Object.entries(assignedData)) {
    if (assigned.key === groupId) {
      // Do we have a round for this street?
      let round = '0'; // Round 0 is unassigned
      let sortbox = '0'; // Sortbox 0 is unassigned
      if (roundsData[pc] !== undefined) {
        round = roundsData[pc].key;
      }

      // Do we have a sortbox for this street?
      if (sortData[round] !== undefined) {
        sortbox = round;
      }

      results[pc] = {
        _id: pc,
        key: round,
        sortbox: sortbox,
      };
    }
  }
  return results;
}
