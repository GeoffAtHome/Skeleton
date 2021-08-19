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
import { connect } from 'pwa-helpers/connect-mixin';
import { PageViewElement } from './page-view-element';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import '@material/mwc-select';
import '@material/mwc-list/mwc-list-item';

// This element is connected to the Redux store.
import { store, RootState } from '../store';

// These are the actions needed by this element.
import { labelDataGetLabel, labelDataRegister } from '../actions/labeldata';
import { navigate, notifyMessage } from '../actions/app';

// These are the actions needed by this element.
import {
  AssignedData,
  AssignedDataItem,
  assignedDataLoad,
} from '../actions/assignedData';
import { polygonDataGetPolygon, polygonDataLoad } from '../actions/polygondata';
import {
  PublicStreetData,
  AllowedViews,
  publicStreetSelectedView,
  PublicStreet,
} from '../actions/publicstreet';
import { RoundData, roundDataLoad } from '../actions/roundsdata';
import { SortboxList, sortboxLoad } from '../actions/sortboxes';
import {
  PostcodeData,
  StreetInfoData,
  StreetInfoItem,
  streetInfoLoad,
} from '../actions/streetInfo';

// We are lazy loading its reducer.
import assignedData, { assignedDataSelector } from '../reducers/assignedData';
import publicStreetMap, {
  publicStreetMapSelector,
} from '../reducers/publicstreet';
import { LoadingStatus, NotifyStatus } from '../reducers/PouchDBStatus';
import polygonData, { polygonDataSelector } from '../reducers/polygondata';
import roundData, { roundDataSelector } from '../reducers/roundsdata';
import sortboxList, { sortboxListSelector } from '../reducers/sortboxes';
import streetInfoData, { streetInfoDataSelector } from '../reducers/streetInfo';
import { userDataSelector } from '../reducers/users';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';
import { streetNames } from '../res/postcodeData';

if (publicStreetMapSelector(store.getState()) === undefined) {
  store.addReducers({ publicStreetMap });
}
if (streetInfoDataSelector(store.getState()) === undefined) {
  store.addReducers({ streetInfoData });
}
if (assignedDataSelector(store.getState()) === undefined) {
  store.addReducers({ assignedData });
}
if (roundDataSelector(store.getState()) === undefined) {
  store.addReducers({ roundData });
}
if (sortboxListSelector(store.getState()) === undefined) {
  store.addReducers({ sortboxList });
}
if (polygonDataSelector(store.getState()) === undefined) {
  store.addReducers({ polygonData });
}

function viewSelected(evt: any) {
  store.dispatch(publicStreetSelectedView(<AllowedViews>evt.target.value));
}

function getNames(view: AllowedViews, item: PublicStreet) {
  const names = [];
  switch (+view) {
    case AllowedViews.English:
      names.push(item.name);
      break;
    case AllowedViews.Welsh:
      if (item.wName !== undefined) {
        names.push(item.wName);
      } else {
        names.push(item.name);
      }
      break;

    default:
      names.push(item.name);
      if (item.wName !== undefined) {
        names.push(item.wName);
      }
  }
  return names;
}

function AddToList(
  item: AssignedDataItem,
  name: string,
  pc: string,
  streetInfo: StreetInfoItem,
  gridData: PostcodeData[]
) {
  const thisItem: PostcodeData = {
    districtSortBox: item.key,
    name,
    _id: pc,
  };

  if (streetInfo !== undefined) {
    thisItem.firstHouse = streetInfo.firstHouse.toString();
    thisItem.lastHouse = streetInfo.lastHouse.toString();
    thisItem.notes = streetInfo.notes;
    thisItem.streetOrder = streetInfo.streetOrder;
    thisItem.numberOfProperties = streetInfo.numberOfProperties;
  }
  gridData.push(thisItem);
}

function MergeData(
  groupId: string,
  roundsData: AssignedData,
  lAssignedData: AssignedData,
  sortData: SortboxList
) {
  const results: AssignedData = {};
  for (const [pc, assigned] of Object.entries(lAssignedData)) {
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
        sortbox,
      };
    }
  }
  return results;
}

@customElement('where-we-deliver-edit')
export class WhereWeDeliverEdit extends connect(store)(PageViewElement) {
  @property({ type: Object })
  private data: PublicStreetData | null = null;

  @property({ type: Array })
  private gridData: Array<PostcodeData> = [];

  @property({ type: Object })
  private streetInfoData: StreetInfoData = {};

  @property({ type: Boolean })
  private admin: boolean = false;

  @property({ type: String })
  private groupId = '';

  @property({ type: Number })
  private assignedDataStatus: LoadingStatus = LoadingStatus.Unknown;

  @property({ type: Number })
  private sortBoxStatus: LoadingStatus = LoadingStatus.Unknown;

  @property({ type: Number })
  private roundDataStatus: LoadingStatus = LoadingStatus.Unknown;

  @property({ type: Number })
  private streetInfoDataStatus: LoadingStatus = LoadingStatus.Unknown;

  @property({ type: Number })
  private polygonDataStatus: LoadingStatus = LoadingStatus.Unknown;

  @query('#selectView')
  private selectView: any;

  @query('#grid')
  private grid: any;

  @property({ type: Boolean })
  private printing: boolean = false;

  @property({ type: Number })
  private selectedView: AllowedViews = AllowedViews.Welsh;

  @property({ type: Object })
  private assignedData: AssignedData = {};

  private roundsData: RoundData = {};

  private sortBoxList: SortboxList = {};

  static get styles() {
    return [
      SharedStyles,
      css`
        #selectView {
          position: fixed;
          fill: white;
          bottom: 15px;
          right: 15px;
          z-index: 1;
        }
      `,
    ];
  }

  protected render() {
    return html`
      ${this.printing !== true
        ? html` <mwc-select
              id="selectView"
              label="Display"
              @selected="${viewSelected}"
            >
              <mwc-list-item value="${AllowedViews.English}"
                >English</mwc-list-item
              >
              <mwc-list-item value="${AllowedViews.Welsh}">Welsh</mwc-list-item>
              <mwc-list-item selected value="${AllowedViews.Both}"
                >Both</mwc-list-item
              >
            </mwc-select>
            <vaadin-grid
              id="grid"
              theme="row-dividers"
              column-reordering-allowed
              multi-sort
              aria-label="Addresses"
              .items="${this.gridData}"
              @click="${this._streetIdChanged}"
              active-item="[[activeItem]]"
            >
              <vaadin-grid-filter-column
                width="60px"
                text-align="end"
                flex-grow="0"
                header="SB"
                path="districtSortBox"
              ></vaadin-grid-filter-column>
              <vaadin-grid-filter-column
                auto-width
                flex-grow="1"
                header="Street Name"
                path="name"
              ></vaadin-grid-filter-column>
              <vaadin-grid-filter-column
                width="60px"
                flex-grow="0"
                header="1st"
                path="firstHouse"
              ></vaadin-grid-filter-column>
              <vaadin-grid-filter-column
                width="60px"
                flex-grow="0"
                header="Last"
                path="lastHouse"
              ></vaadin-grid-filter-column>
              <vaadin-grid-filter-column
                width="60px"
                flex-grow="0"
                header="Number"
                path="numberOfProperties"
              ></vaadin-grid-filter-column>
              <vaadin-grid-filter-column
                width="115px"
                flex-grow="0"
                header="Street order"
                path="streetOrder"
              ></vaadin-grid-filter-column>
              <vaadin-grid-filter-column
                auto-width
                flex-grow="1"
                header="Notes"
                path="notes"
              ></vaadin-grid-filter-column>
            </vaadin-grid>`
        : html` <div>
            <table>
              <thead>
                <tr>
                  <th width="60px">SB</th>
                  <th>Street Name</th>
                  <th width="60px">1st</th>
                  <th width="60px">Last</th>
                  <th width="115px">Street Order</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${this.gridData.map(
                  item => html`<tr>
                    <td>${item.districtSortBox}</td>
                    <td>${item.name}</td>
                    <td>${item.firstHouse}</td>
                    <td>${item.lastHouse}</td>
                    <td>${item.streetOrder}</td>
                    <td>${item.notes}</td>
                  </tr>`
                )}
              </tbody>
            </table>
          </div>`}
    `;
  }

  updated(changedProps: PropertyValues) {
    if (changedProps.has('assignedDataStatus'))
      NotifyStatus('Assigned data', this.assignedDataStatus);

    if (changedProps.has('streetInfoDataStatus'))
      NotifyStatus('Street info', this.streetInfoDataStatus);

    if (changedProps.has('sortBoxStatus'))
      NotifyStatus('Sort box', this.sortBoxStatus);

    if (changedProps.has('roundDataStatus'))
      NotifyStatus('Rounds data', this.roundDataStatus);

    if (changedProps.has('polygonDataStatus'))
      NotifyStatus('Polygon data', this.polygonDataStatus);

    if (changedProps.has('admin') || changedProps.has('groupId')) {
      // Load the data required for this page
      if (this.admin === false && this.groupId !== '') {
        store.dispatch(roundDataLoad(this.admin, this.groupId));
        store.dispatch(sortboxLoad(this.groupId));
      }
      store.dispatch(assignedDataLoad());
      store.dispatch(streetInfoLoad());
      store.dispatch(polygonDataLoad());
      store.dispatch(labelDataRegister());
    }

    if (
      changedProps.has('active') ||
      changedProps.has('assignedData') ||
      changedProps.has('streetInfoData') ||
      changedProps.has('selectedView')
    ) {
      let LAssignedData: AssignedData = {};

      if (this.admin === false && this.groupId !== '') {
        LAssignedData = MergeData(
          this.groupId,
          this.roundsData,
          this.assignedData,
          this.sortBoxList
        );
      } else {
        LAssignedData = this.assignedData;
      }

      this.mergeTheData(this.selectedView, LAssignedData, this.streetInfoData);
    }

    if (changedProps.has('gridData')) {
      if (this.selectView !== null) {
        const view = this.selectedView;
        this.selectView.select(+view);
      }
    }
  }

  _streetIdChanged(_el: Event) {
    const item = this.grid.activeItem;
    this.grid.activeItem = {};
    if ('_id' in item) {
      if (
        this.assignedDataStatus !== LoadingStatus.Loaded ||
        this.streetInfoDataStatus !== LoadingStatus.Loaded ||
        this.polygonDataStatus !== LoadingStatus.Loaded
      ) {
        store.dispatch(notifyMessage('Data still loading.'));
      } else {
        store.dispatch(polygonDataGetPolygon(item._id));
        store.dispatch(labelDataGetLabel(item._id));
        const newLocation = `/#mapEdit`;
        window.history.pushState({}, '', newLocation);
        store.dispatch(navigate(decodeURIComponent(newLocation)));
      }
    }
  }

  stateChanged(state: RootState) {
    if (state.app!.page === 'whereWeDeliverEdit') {
      const usersState = userDataSelector(state);
      this.admin = usersState!._newUser.claims.administrator;
      this.groupId = usersState!._newUser.claims.group;

      const streetInfoState = streetInfoDataSelector(state);
      this.streetInfoData = streetInfoState!._streetInfo;
      this.streetInfoDataStatus = streetInfoState!._loadingStatus;

      const assignedDataState = assignedDataSelector(state);
      this.assignedData = assignedDataState!._assignedData;
      this.assignedDataStatus = assignedDataState!._loadingStatus;

      const roundsDataState = roundDataSelector(state);
      this.roundsData = roundsDataState!._roundData;
      this.roundDataStatus = roundsDataState!._loadingStatus;

      const publicStreetState = publicStreetMapSelector(state);
      this.selectedView = publicStreetState!.selectedView;

      const sortboxState = sortboxListSelector(state);
      this.sortBoxList = sortboxState!._sortboxList;
      this.sortBoxStatus = sortboxState!._loadingStatus;

      const polygonDataState = polygonDataSelector(state);
      this.polygonDataStatus = polygonDataState!._loadingStatus;
    }
  }

  private mergeTheData(
    view: AllowedViews,
    lAssignedData: AssignedData,
    lStreetInfoData: StreetInfoData
  ) {
    const gridData: Array<PostcodeData> = [];

    if (this.selectView !== null) {
      this.selectView.select(+view);
    }

    if (lAssignedData !== undefined && lStreetInfoData !== undefined) {
      for (const [pc, item] of Object.entries(lAssignedData)) {
        const pci = streetNames[pc];
        const streetInfo = lStreetInfoData[pc];

        const names = getNames(view, pci);

        for (const name of names) {
          AddToList(item, name, pc, streetInfo, gridData);
        }
      }
      this.gridData = gridData;
    }
  }
}
