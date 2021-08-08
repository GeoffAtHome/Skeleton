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
import { streetNameCompare, compareStreet } from './sorting';
import { getTextColor } from './getTextColour';

// We are lazy loading its reducer.
import streetmap, { streetMapSelector } from '../reducers/streetmap';
import groupData, { groupDataSelector } from '../reducers/groupdata';
import assignedData, { assignedDataSelector } from '../reducers/assignedData';
import streetInfoData, { streetInfoDataSelector } from '../reducers/streetInfo';
import userData, { userDataSelector } from '../reducers/users';
import sortData, { sortDataSelector } from '../reducers/sortData';
import roundData, { roundDataSelector } from '../reducers/roundsdata';

// These are the actions needed by this element.
import { GroupData, groupDataLoad } from '../actions/groupdata';

import { streetNames } from '../res/postcodeData';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles';
import {
  PublicStreetData,
  AllowedViews,
  PublicStreet,
} from '../actions/publicstreet';
import {
  StreetInfoData,
  StreetInfoItem,
  streetInfoLoad,
} from '../actions/streetInfo';
import {
  AssignedData,
  assignedDataLoad,
  AssignedDataItem,
} from '../actions/assigneddata';
import { SortData, sortDataLoad } from '../actions/sortData';
import { RoundData, roundDataLoad } from '../actions/roundsdata';
import { notifyMessage } from '../actions/app';

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
if (streetMapSelector(store.getState()) === undefined) {
  store.addReducers({ streetmap });
}
if (groupDataSelector(store.getState()) === undefined) {
  store.addReducers({ groupData });
}
if (assignedDataSelector(store.getState()) === undefined) {
  store.addReducers({ assignedData });
}
if (streetInfoDataSelector(store.getState()) === undefined) {
  store.addReducers({ streetInfoData });
}
if (userDataSelector(store.getState()) === undefined) {
  store.addReducers({ userData });
}
if (sortDataSelector(store.getState()) === undefined) {
  store.addReducers({ sortData });
}
if (roundDataSelector(store.getState()) === undefined) {
  store.addReducers({ roundData });
}

function getRoundDataSize(gridData: GridData[], key: string) {
  const data = gridData.filter(item => {
    return item.round === key;
  });
  return data.length;
}

function getRoundData(gridData: GridData[], key: string) {
  const data = gridData.filter(item => {
    return item.round === key;
  });
  // Strip postcode and town from item
  const shortData: Array<{ name: string; sb: string | undefined }> = data.map(
    item => {
      const rx = `, ${item.pc}`;
      // Remove Postcode
      const items = item.name.replace(rx, '').split(',');
      const { sb } = item;
      // Strip Town
      items.pop();
      return { name: items.join(', '), sb };
    }
  );
  // data.name is now a list of streets without postcode or town.
  const uniqueStreets = [
    ...new Set(shortData.map(item => `${item.name}:${item.sb}`)),
  ];
  const streets: Array<{ name: string; sb: string }> = [];
  uniqueStreets.map(street => {
    const [name, sb] = street.split(':');
    streets.push({ name, sb });
    return street;
  });

  return streets.sort((left, right) => compareStreet(left.name, right.name));
}

function getPostcodes(gridData: GridData[], key: string) {
  const data = gridData.filter(item => {
    return item.round === key;
  });
  const uniquePostcodes = [...new Set(data.map(item => item.pc))];
  return uniquePostcodes.sort(compareStreet).join(', ');
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

@customElement('round-boxes')
export class RoundBoxes extends connect(store)(PageViewElement) {
  @property({ type: String })
  private groupId: string = '';

  @property({ type: Boolean })
  private admin = false;

  @property({ type: Object })
  private data: PublicStreetData | null = null;

  @property({ type: Array })
  private gridData: Array<GridData> = [];

  @property({ type: Boolean, reflect: true })
  private drawOpened: boolean = false;

  @property({ type: Object })
  private streetInfoData: StreetInfoData = {};

  @query('#grid')
  private grid: any;

  @property({ type: Object })
  private roundData: GroupData = {};

  @property({ type: Object })
  private assignedData: AssignedData = {};

  @property({ type: Object })
  private sortData: SortData = {};

  @property({ type: Object })
  private cRoundData: RoundData = {};

  @property({ type: Boolean })
  private printing: boolean = false;

  static get styles() {
    return [
      SharedStyles,
      css`
        :host {
          display: block;
        }

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
        ? html` <div class="cards">
            ${Object.entries(this.roundData).map(([key, round]) =>
              getRoundDataSize(this.gridData, key) > 0
                ? html` <div class="sb">
                    <header
                      style="--cl: ${round.colour}; --tx: ${getTextColor(
                        round.colour
                      )}"
                    >
                      <div class="al">${round.name}</div>
                      <div class="ar">${key}</div>
                    </header>
                    <main>
                      ${getRoundData(this.gridData, key).map(
                        item => html`
                          <div class="row">
                            <div class="al">${item.name}</div>
                            <div class="ar it">${item.sb}</div>
                          </div>
                        `
                      )}
                      <p>${getPostcodes(this.gridData, key)}</p>
                    </main>
                    <footer class="end">${round.notes}</footer>
                  </div>`
                : ''
            )}
          </div>`
        : html`
            <div class="cards">
              ${Object.entries(this.roundData).map(([key, round]) =>
                getRoundDataSize(this.gridData, key) > 0
                  ? html` <div class="sb">
                      <header>
                        <span class="al">${round.name}</span>
                        <span class="ar">${key}</span>
                      </header>
                      <main>
                        ${getRoundData(this.gridData, key).map(
                          item => html`
                            <div class="row">
                              <div class="al">${item.name}</div>
                              <div class="ar it">${item.sb}</div>
                            </div>
                          `
                        )}
                        <p>${getPostcodes(this.gridData, key)}</p>
                      </main>
                      <footer>NOTES: ${round.notes}</footer>
                    </div>`
                  : ''
              )}
            </div>
          `}
    `;
  }

  updated(changedProps: PropertyValues) {
    if (
      changedProps.has('streetInfoData') ||
      changedProps.has('roundData') ||
      changedProps.has('assignedData') ||
      changedProps.has('cRoundData') ||
      changedProps.has('sortData')
    ) {
      if (
        Object.keys(this.streetInfoData).length !== 0 &&
        Object.keys(this.roundData).length !== 0 &&
        Object.keys(this.assignedData).length !== 0 &&
        Object.keys(this.cRoundData).length !== 0
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

    if (state.app?.page === 'rounds') {
      const usersState = userDataSelector(state);
      if (usersState) {
        if (
          this.admin !== usersState._newUser.claims.administrator ||
          this.groupId !== usersState._newUser.claims.group
        ) {
          this.admin = usersState._newUser.claims.administrator;
          this.groupId = usersState._newUser.claims.group;

          if (!(this.admin === false && this.groupId === '')) {
            store.dispatch(notifyMessage('Loading: Group data'));
            store.dispatch(groupDataLoad(this.admin, this.groupId));
            store.dispatch(notifyMessage('Loading: Rounds data'));
            store.dispatch(roundDataLoad(this.admin, this.groupId));
            store.dispatch(notifyMessage('Loading: Sort data'));
            store.dispatch(sortDataLoad(this.groupId));
          }
          // Load the data required for this page
          store.dispatch(streetInfoLoad());
          store.dispatch(assignedDataLoad());
        }
      }

      const streetInfoDataState = streetInfoDataSelector(state);
      this.streetInfoData = streetInfoDataState!._streetInfo;

      const groupDataState = groupDataSelector(state);
      this.roundData = groupDataState!._groupData;

      const assignedDataState = assignedDataSelector(state);
      this.assignedData = assignedDataState!._assignedData;

      const roundDataState = roundDataSelector(state);
      this.cRoundData = roundDataState!._roundData;

      const sortDataState = sortDataSelector(state);
      this.sortData = sortDataState!._sortData;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private getNames(view: AllowedViews, item: PublicStreet) {
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

  private mergeTheData(
    lAssignedData: AssignedData,
    lStreetInfoData: StreetInfoData
  ) {
    const gridData: Array<GridData> = [];

    if (
      lAssignedData !== undefined &&
      lStreetInfoData !== undefined &&
      streetNames !== null
    ) {
      for (const [pc, item] of Object.entries(lAssignedData)) {
        const pci = streetNames[pc];
        const streetInfo: StreetInfoItem = lStreetInfoData[pc];

        const names = this.getNames(AllowedViews.Both, pci);

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
    item: AssignedDataItem,
    name: string,
    pc: string,
    streetInfo: StreetInfoItem,
    gridData: GridData[]
  ) {
    if (Object.keys(this.roundData).length !== 0) {
      try {
        const index = item.key === undefined ? 0 : item.key;

        const thisItem: GridData = {
          round: item.key,
          colour: this.roundData[index]!.colour,
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
      } catch (err) {
        console.log(err);
      }
    }
  }
}
