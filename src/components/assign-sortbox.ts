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
import './loading-spinner';

// This element is connected to the Redux store.
import { store, RootState } from '../store';
import { streetNameCompare } from './sorting';
import { getTextColor } from './getTextColour';

// These are the actions needed by this element.
// AssignedData, SortboxData, groupData?
import { AssignedData, assignedDataLoad } from '../actions/assigneddata';
import {
  SortboxItem,
  SortboxList,
  sortboxLoad,
  sortboxSelect,
} from '../actions/sortboxes';
import { RoundData, roundDataLoad } from '../actions/roundsdata';
import { notifyMessage } from '../actions/app';
import {
  SortData,
  SortDataItem,
  sortDataLoad,
  sortDataUpdate,
} from '../actions/sortData';
import {
  StreetInfoData,
  StreetInfoItem,
  streetInfoLoad,
} from '../actions/streetInfo';
import {
  AllowedViews,
  publicStreetSelectedView,
  getNames,
} from '../actions/publicstreet';
import { fullyLoaded } from '../actions/syncState';

// We are lazy loading its reducer.
import assignedData, { assignedDataSelector } from '../reducers/assignedData';
import publicStreetMap, {
  publicStreetMapSelector,
} from '../reducers/publicstreet';
import roundData, { roundDataSelector } from '../reducers/roundsdata';
import sortboxList, { sortboxListSelector } from '../reducers/sortboxes';
import sortDataList, { sortDataSelector } from '../reducers/sortData';
import streetInfoData, { streetInfoDataSelector } from '../reducers/streetInfo';
import { userDataSelector } from '../reducers/users';

import { streetNames } from '../res/postcodeData';
// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';
import {
  assignedDataURL,
  streetInfoURL,
  sortBoxesURL,
  roundsURL,
  sortDataURL,
} from '../reducers/dbconst';
import syncState, { syncStateSelector } from '../reducers/syncState';

if (assignedDataSelector(store.getState()) === undefined) {
  store.addReducers({ assignedData });
}
if (sortDataSelector(store.getState()) === undefined) {
  store.addReducers({ sortDataList });
}
if (sortboxListSelector(store.getState()) === undefined) {
  store.addReducers({ sortboxList });
}
if (streetInfoDataSelector(store.getState()) === undefined) {
  store.addReducers({ streetInfoData });
}
if (publicStreetMapSelector(store.getState()) === undefined) {
  store.addReducers({ publicStreetMap });
}
if (roundDataSelector(store.getState()) === undefined) {
  store.addReducers({ roundData });
}
if (syncStateSelector(store.getState()) === undefined) {
  store.addReducers({ syncState });
}

const publicDB: Array<string> = [assignedDataURL, streetInfoURL];
const userDB: Array<string> = [sortBoxesURL, roundsURL, sortDataURL];

interface GridData {
  name: string;
  bc: string;
  tx: string;
  pc: string;
  firstHouse?: string;
  lastHouse?: string;
  notes?: string;
  numberOfProperties?: number;
  streetOrder?: string;
  sb?: string;
}

function viewSelected(evt: any) {
  store.dispatch(publicStreetSelectedView(<AllowedViews>evt.target.value));
}

function MergeAssignedData(
  groupId: string,
  lRoundsData: AssignedData,
  lAssignedData: AssignedData,
  lSortData: AssignedData
) {
  const results: AssignedData = {};
  for (const [pc, assigned] of Object.entries(lAssignedData)) {
    if (assigned.key === groupId) {
      // Do we have a round for this street?
      let round = '0'; // Round 0 is unassigned
      let sortbox = '0'; // Sortbox 0 is unassigned
      if (lRoundsData[pc] !== undefined) {
        round = lRoundsData[pc].key;
      }

      // Do we have a sortbox for this street?
      if (lSortData[pc] !== undefined) {
        sortbox = lSortData[pc].key;
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

function AddToList(
  item: SortDataItem,
  name: string,
  pc: string,
  streetInfo: StreetInfoItem,
  gridData: GridData[],
  lSortboxList: SortboxList
) {
  const index = item.sortbox === undefined ? 0 : item.sortbox;
  const thisItem: GridData = {
    sb: index.toString(),
    bc: lSortboxList[index].colour,
    tx: getTextColor(lSortboxList[index].colour),
    name,
    pc,
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

function mergeTheData(
  view: AllowedViews,
  sortData: SortData,
  lStreetInfoData: StreetInfoData,
  lSortboxList: SortboxList
) {
  const gridData: Array<GridData> = [];

  if (sortData !== undefined && streetInfoData !== undefined) {
    for (const [pc, item] of Object.entries(sortData)) {
      const pci = streetNames[pc];
      const streetInfo = lStreetInfoData[pc];

      const names = getNames(view, pci);

      for (const name of names) {
        AddToList(item, name, pc, streetInfo, gridData, lSortboxList);
      }
    }
    return gridData.sort((left, right) =>
      streetNameCompare(left.name, right.name)
    );
  }
  return gridData;
}

@customElement('assign-sortbox')
export class AssignSortbox extends connect(store)(PageViewElement) {
  @property({ type: Array })
  private gridData: Array<GridData> = [];

  @property({ type: Boolean, reflect: true })
  private drawOpened: boolean = false;

  @property({ type: Object })
  private streetInfoData: StreetInfoData = {};

  @property({ type: Boolean })
  private _loading = true;

  @query('#selectView')
  private selectView: any;

  @query('#grid')
  private grid: any;

  @property({ type: Object })
  private sortboxList: SortboxList = {};

  @property({ type: Object })
  private selectedSortbox: SortboxItem = {
    _id: '',
    name: '',
    notes: '',
    contactDetails: '',
    colour: '',
  };

  @property({ type: Number })
  private selectedView: AllowedViews = AllowedViews.Welsh;

  @property({ type: Object })
  private assignedData: AssignedData = {};

  @property({ type: Object })
  private cRoundData: RoundData = {};

  @property({ type: Object })
  private sortData: SortData = {};

  @property({ type: Boolean })
  private printing: boolean = false;

  @property({ type: Boolean })
  private admin: boolean = true;

  @property({ type: String })
  private groupId = '';

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

        #selectSortbox {
          position: fixed;
          fill: white;
          bottom: 15px;
          right: 255px;
          z-index: 1;
        }

        .name {
          background-color: var(--cl);
          color: var(--tx);
        }
      `,
    ];
  }

  protected render() {
    return html`
      <loading-spinner ?loading="${this._loading}"></loading-spinner>
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
            <mwc-select
              id="selectSortbox"
              label="Select sort box"
              @selected="${this.sortboxSelected}"
            >
              ${Object.entries(this.sortboxList).map(
                ([id, key]) =>
                  html`<mwc-list-item
                    value="${id}"
                    style="background-color:${key.colour}"
                    >${key.name}</mwc-list-item
                  >`
              )}
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
                path="sb"
              ></vaadin-grid-filter-column>
              <vaadin-grid-filter-column
                auto-width
                flex-grow="1"
                style="background:[[item.colour]]"
                header="Street Name"
                path="name"
              >
                <template>
                  <div
                    class="name"
                    style="--cl: [[item.bc]]; --tx: [[item.tx]]"
                  >
                    [[item.name]]
                  </div>
                </template>
              </vaadin-grid-filter-column>
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
                width="125px"
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
                    <td>${item.sb}</td>
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
    if (changedProps.has('admin') || changedProps.has('groupId')) {
      // Reset loading flag
      this._loading = true;

      // Load the data required for this page
      store.dispatch(sortboxLoad(this.groupId));
      store.dispatch(roundDataLoad(this.admin, this.groupId));
      store.dispatch(sortDataLoad(this.groupId));
      store.dispatch(streetInfoLoad());
      store.dispatch(assignedDataLoad());
    }
    if (
      changedProps.has('active') ||
      changedProps.has('groupId') ||
      changedProps.has('cRoundData') ||
      changedProps.has('assignedData') ||
      changedProps.has('sortData') ||
      changedProps.has('streetInfoData') ||
      changedProps.has('selectedView')
    ) {
      this.MergeSortboxes();
    }

    if (changedProps.has('gridData') || changedProps.has('selectedView')) {
      this.updateView(this.selectedView);
    }
  }

  _streetIdChanged(_el: Event) {
    const item: GridData = this.grid.activeItem;
    if ('pc' in item && this.selectedSortbox._id !== '') {
      // Update group and street
      const sortDataItem: SortDataItem = {
        _id: item.pc,
        key: this.selectedSortbox._id,
      };
      store.dispatch(sortDataUpdate(sortDataItem));
      this.sortData[item.pc] = sortDataItem;

      this.MergeSortboxes();
    } else {
      store.dispatch(notifyMessage('Select sort box to assign'));
    }
    this.grid.activeItem = {};
  }

  private MergeSortboxes() {
    const assignedMergedData = MergeAssignedData(
      this.groupId,
      this.cRoundData,
      this.assignedData,
      this.sortData
    );

    this.gridData = mergeTheData(
      this.selectedView,
      assignedMergedData,
      this.streetInfoData,
      this.sortboxList
    );
  }

  private sortboxSelected(evt: any) {
    this.selectedSortbox = this.sortboxList[evt.target.value];
    this.selectedSortbox._id = evt.target.value;
    store.dispatch(sortboxSelect(this.selectedSortbox));
  }

  stateChanged(state: RootState) {
    if (this.drawOpened !== state.app!.drawerOpened) {
      this.drawOpened = state.app!.drawerOpened;
      if (this.grid !== null) {
        if (this.drawOpened) {
          this.grid.setAttribute('drawOpened', '');
        } else {
          this.grid.removeAttribute('drawOpened');
        }
      }
    }

    if (state.app!.page === 'assignSortBox') {
      if (this._loading) {
        const _syncState = syncStateSelector(state);
        this._loading = fullyLoaded(
          publicDB,
          userDB,
          this.groupId,
          _syncState!._docs
        );
      }

      const usersState = userDataSelector(state);
      this.admin = usersState!._newUser.claims.administrator;
      this.groupId = usersState!._newUser.claims.group;

      const assignedDataState = assignedDataSelector(state);
      this.assignedData = assignedDataState!._assignedData;

      const streetInfoState = streetInfoDataSelector(state);
      this.streetInfoData = streetInfoState!._streetInfo;

      const sortDataState = sortDataSelector(state);
      this.sortData = sortDataState!._sortData;

      const sortboxListState = sortboxListSelector(state);
      this.sortboxList = sortboxListState!._sortboxList;

      const roundDataState = roundDataSelector(state);
      this.cRoundData = roundDataState!._roundData;

      const publicStreetState = publicStreetMapSelector(state);
      this.selectedView = publicStreetState!.selectedView;
    }
  }

  private updateView(view: AllowedViews) {
    if (this.selectView !== null) {
      this.selectView.select(+view);
    }
  }
}
