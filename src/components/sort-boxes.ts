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
import { streetNameCompare, compareStreet } from './sorting';
import { getTextColor } from './getTextColour';

// These are the actions needed by this element.
import { AssignedData, assignedDataLoad } from '../actions/assigneddata';
import { RoundData, roundDataLoad } from '../actions/roundsdata';
import { SortboxList, sortboxLoad } from '../actions/sortboxes';
import { SortData, SortDataItem, sortDataLoad } from '../actions/sortData';
import { AllowedViews, getNames } from '../actions/publicstreet';
import {
  StreetInfoData,
  StreetInfoItem,
  streetInfoLoad,
} from '../actions/streetInfo';
import { streetNames } from '../res/postcodeData';
import { notifyMessage } from '../actions/app';

// We are lazy loading its reducer.
import assignedData, { assignedDataSelector } from '../reducers/assignedData';
import roundData, { roundDataSelector } from '../reducers/roundsdata';
import sortboxList, { sortboxListSelector } from '../reducers/sortboxes';
import sortDataList, { sortDataSelector } from '../reducers/sortData';
import streetInfoData, { streetInfoDataSelector } from '../reducers/streetInfo';
import syncState, { syncStateSelector } from '../reducers/syncState';
import {
  assignedDataURL,
  roundsURL,
  sortBoxesURL,
  sortDataURL,
  streetInfoURL,
} from '../reducers/dbconst';
import { userDataSelector } from '../reducers/users';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';
import { NotifyStatus } from '../reducers/PouchDBStatus';
import { fullyLoaded } from '../actions/syncState';

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
if (roundDataSelector(store.getState()) === undefined) {
  store.addReducers({ roundData });
}
if (syncStateSelector(store.getState()) === undefined) {
  store.addReducers({ syncState });
}

const publicDB: Array<string> = [streetInfoURL, assignedDataURL];
const userDB: Array<string> = [sortBoxesURL, roundsURL, sortDataURL];

interface GridData {
  name: string;
  colour: string;
  pc: string;
  firstHouse?: string;
  lastHouse?: string;
  notes?: string;
  numberOfProperties?: number;
  streetOrder?: string;
  round?: string;
  sb?: string;
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

@customElement('sort-boxes')
export class SortBoxes extends connect(store)(PageViewElement) {
  @property({ type: Array })
  private gridData: Array<GridData> = [];

  @property({ type: Object })
  private assignedData: AssignedData = {};

  @property({ type: Object })
  private cRoundData: RoundData = {};

  @property({ type: Object })
  private sortData: SortData = {};

  @property({ type: Object })
  private streetInfoData: StreetInfoData = {};

  @query('#grid')
  private grid: any;

  @property({ type: Object })
  private sortboxList: SortboxList = {};

  @property({ type: Object })
  private sortDataList: SortData = {};

  @property({ type: Boolean })
  private printing: boolean = false;

  @property({ type: Boolean })
  private admin: boolean = true;

  @property({ type: String })
  private groupId = '';

  @property({ type: Boolean })
  private _loading = true;

  @property({ type: String })
  private assignedDataStatus = '';

  @property({ type: String })
  private streetInfoDataStatus = '';

  @property({ type: String })
  private sortDataStatus = '';

  @property({ type: String })
  private sortboxListStatus = '';

  @property({ type: String })
  private cRoundDataStatus = '';

  static get styles() {
    return [
      SharedStyles,
      css`
        header {
          display: grid;
          grid-template-columns: 1fr minmax(10px, 3%);
          font-weight: bold;
          padding: 0.5em;
          margin: 0px;
          background-color: var(--cl);
          color: var(--tx);
        }

        footer {
          background-color: grey;
          font-style: italic;
          padding: 0.5em;
        }

        main {
          padding: 0.5em;
        }

        .cards {
          display: flex;
          flex-wrap: wrap;
          grid-gap: 1rem;
          padding: 2rem;
          justify-content: center;
        }

        .sb {
          flex: 1 1 600px; /*  Stretching: */
          flex: 0 1 600px; /*  No stretching: */
          display: grid;
          grid-template-rows: auto 1fr auto;
        }

        .al {
          width: 95%;
        }

        .ar {
          text-align: right;
        }

        .row {
          display: grid;
          padding-left: 0.5em;
          padding-right: 0.5em;
          grid-template-columns: 1fr minmax(10px, 3%);
        }

        .row:nth-child(even) {
          background: #ccc;
        }
        .row:nth-child(odd) {
          background: #fff;
        }

        .it {
          font-style: italic;
        }

        @media print {
          header {
            background-color: white;
            color: black;
          }

          .sb {
            display: block;
            grid-template-rows: auto 1fr auto;
            page-break-after: always;
            position: relative;
          }

          .cards {
            display: block;
            position: relative;
          }

          footer.end {
            page-break-after: always !important;
            background-color: grey;
            font-style: italic;
            padding: 0.5em;
            position: relative !important;
          }

          @page {
            size: A4;
            margin-top: 1cm;
            margin-bottom: 0cm;
          }
        }
      `,
    ];
  }

  protected render() {
    return html`
      ${this.printing !== true
        ? html` <loading-spinner ?loading="${this._loading}"></loading-spinner>
            <div class="cards">
              ${Object.entries(this.sortboxList).map(([key, sortBox]) =>
                this.getSortboxDataSize(key) > 0
                  ? html` <div class="sb">
                      <header
                        style="--cl: ${sortBox.colour}; --tx: ${getTextColor(
                          sortBox.colour
                        )}"
                      >
                        <span class="al">${sortBox.name}</span>
                        <span class="ar">${key}</span>
                      </header>
                      <main>
                        ${this.getSortboxData(key).map(
                          item => html`
                            <div class="row">
                              <span class="al">${item.name}</span>
                              <span class="ar it">${item.round}</span>
                            </div>
                          `
                        )}
                        <p>${this.getPostcodes(key)}</p>
                      </main>
                      <footer>${sortBox.notes}</footer>
                    </div>`
                  : ''
              )}
            </div>`
        : html`
            <div class="cards">
              ${Object.entries(this.sortboxList).map(([key, sortBox]) =>
                this.getSortboxDataSize(key) > 0
                  ? html` <div class="sb">
                      <header
                        style="--cl: ${sortBox.colour}; --tx: ${getTextColor(
                          sortBox.colour
                        )}"
                      >
                        <span class="al">${sortBox.name}</span>
                        <span class="ar">${key}</span>
                      </header>
                      <main>
                        ${this.getSortboxData(key).map(
                          item => html`
                            <div class="row">
                              <span class="al">${item.name}</span>
                              <span class="ar it">${item.round}</span>
                            </div>
                          `
                        )}
                        <p>${this.getPostcodes(key)}</p>
                      </main>
                      <footer>${sortBox.notes}</footer>
                    </div>`
                  : ''
              )}
            </div>
          `}
    `;
  }

  private getSortboxDataSize(key: string) {
    const data = this.gridData.filter(item => {
      return item.sb === key;
    });
    return data.length;
  }

  private getSortboxData(key: string) {
    const data = this.gridData.filter(item => {
      return item.sb === key;
    });
    // Strip postcode from String
    const shortData: Array<{ name: string; round: string | undefined }> = [];

    data.map(item => {
      const rx = `, ${item.pc}`;
      // Remove Postcode
      const items = item.name.replace(rx, '').split(',');
      // Strip Town
      items.pop();
      shortData.push({ name: items.join(', '), round: item.round });

      return '';
    });
    const uniqueStreets = [
      ...new Set(data.map(item => `${item.name}:${item.round}`)),
    ];
    const streets: Array<{ name: string; round: string }> = [];
    uniqueStreets.map(street => {
      const [name, round] = street.split(':');
      streets.push({ name, round });

      return '';
    });

    return streets.sort((left, right) => compareStreet(left.name, right.name));
  }

  private getPostcodes(key: string) {
    const data = this.gridData.filter(item => {
      return item.sb === key;
    });
    const uniquePostcodes = [...new Set(data.map(item => item.pc))];
    return uniquePostcodes.sort(compareStreet).join(', ');
  }

  updated(changedProps: PropertyValues) {
    if (changedProps.has('assignedDataStatus'))
      NotifyStatus('Assigned data', this.assignedDataStatus);

    if (changedProps.has('streetInfoDataStatus'))
      NotifyStatus('Street info', this.streetInfoDataStatus);

    if (changedProps.has('sortDataStatus'))
      NotifyStatus('Sort data', this.sortDataStatus);

    if (changedProps.has('sortboxListStatus'))
      NotifyStatus('Sort boxes', this.sortboxListStatus);

    if (changedProps.has('cRoundDataStatus'))
      NotifyStatus('Round data', this.cRoundDataStatus);

    if (changedProps.has('admin') || changedProps.has('groupId')) {
      // Load the data required for this page
      store.dispatch(sortboxLoad(this.groupId));
      store.dispatch(roundDataLoad(this.admin, this.groupId));
      store.dispatch(sortDataLoad(this.groupId));
      store.dispatch(streetInfoLoad());
      store.dispatch(assignedDataLoad());
    }

    if (
      changedProps.has('data') ||
      changedProps.has('assignedData') ||
      changedProps.has('streetInfoData') ||
      changedProps.has('sortboxData')
    ) {
      this.mergeTheData(this.sortDataList, this.streetInfoData);
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
      const assignedMergedData = MergeAssignedData(
        this.groupId,
        this.cRoundData,
        this.assignedData,
        this.sortData
      );

      this.mergeTheData(assignedMergedData, this.streetInfoData);
    }
  }

  stateChanged(state: RootState) {
    if (state.app!.page === 'sortBoxes') {
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

      const assignedDataState = assignedDataSelector(state);
      this.assignedData = assignedDataState!._assignedData;
      this.assignedDataStatus = assignedDataState!._loadingStatus;

      const streetInfoState = streetInfoDataSelector(state);
      this.streetInfoData = streetInfoState!._streetInfo;
      this.streetInfoDataStatus = streetInfoState!._loadingStatus;

      const sortDataState = sortDataSelector(state);
      this.sortData = sortDataState!._sortData;
      this.sortDataStatus = sortDataState!._loadingStatus;

      const sortboxListState = sortboxListSelector(state);
      this.sortboxList = sortboxListState!._sortboxList;
      this.sortboxListStatus = sortboxListState!._loadingStatus;

      const roundDataState = roundDataSelector(state);
      this.cRoundData = roundDataState!._roundData;
      this.cRoundDataStatus = roundDataState!._loadingStatus;
    }
  }

  private mergeTheData(sortData: SortData, lStreetInfoData: StreetInfoData) {
    const gridData: Array<GridData> = [];

    if (sortData !== undefined && lStreetInfoData !== undefined) {
      for (const [pc, item] of Object.entries(sortData)) {
        const pci = streetNames[pc];
        const streetInfo = lStreetInfoData[pc];

        const names = getNames(AllowedViews.Both, pci);

        for (const name of names) {
          this.AddToList(item, name, pc, streetInfo, gridData);
        }
      }
      this.gridData = gridData.sort((left, right) =>
        streetNameCompare(left.name, right.name)
      );
    }
  }

  private AddToList(
    item: SortDataItem,
    name: string,
    pc: string,
    streetInfo: StreetInfoItem,
    gridData: GridData[]
  ) {
    const index = item.sortbox === undefined ? 0 : item.sortbox;
    const thisItem: GridData = {
      round: item.key,
      colour: this.sortboxList[index].colour,
      name,
      pc,
      sb: item.sortbox,
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
}
