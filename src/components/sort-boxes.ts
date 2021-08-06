/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/*
import {
  html,
  property,
  query,
  customElement,
  css,
  PropertyValues,
} from "lit-element";
import { PageViewElement } from "../../../utils/page-view-element";
import { connect } from "pwa-helpers/connect-mixin";

import "@vaadin/vaadin-grid/vaadin-grid";
import "@vaadin/vaadin-grid/vaadin-grid-selection-column";
import "@vaadin/vaadin-grid/vaadin-grid-filter-column";
import "@vaadin/vaadin-grid/vaadin-grid-sorter";
import "@material/mwc-select";
import "@material/mwc-list/mwc-list-item";

// This element is connected to the Redux store.
import { store, RootState } from "../store";
import { streetNameCompare, compareStreet } from "../../../utils/sorting";
import { getTextColor } from "../../../utils/getTextColour";

// These are the actions needed by this element.
import { StreetInfoData, StreetInfoItem } from "../actions/streetmap";

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

// We are lazy loading its reducer.
import streetmap, { streetMapSelector } from "../reducers/streetmap";
if (streetMapSelector(store.getState()) === undefined) {
  store.addReducers({ streetmap });
}

// These are the actions needed by this element.
import {
  AssignedData,
  AssignedDataItem,
  SortboxData,
} from "../actions/groupdata";

// We are lazy loading its reducer.
import groupdata, { groupdataSelector } from "../reducers/groupdata";
if (groupdataSelector(store.getState()) === undefined) {
  store.addReducers({ groupdata });
}

// These are the shared styles needed by this element.
import { SharedStyles } from "../../../utils/shared-styles";
import {
  PublicStreetData,
  AllowedViews,
  PublicStreet,
} from "../actions/publicstreet";

@customElement("sort-boxes")
export class SortBoxes extends connect(store)(PageViewElement) {
  @property({ type: Object })
  private data: PublicStreetData | null = null;

  @property({ type: Array })
  private griddata: Array<GridData> = [];

  @property({ type: Boolean, reflect: true })
  private drawopened: boolean = false;

  @property({ type: Object })
  private streetInfoData: StreetInfoData = {};

  @query("#grid")
  private grid: any;

  @property({ type: Object })
  private sortboxData: SortboxData = {};

  @property({ type: Object })
  private assignedData: AssignedData = {};

  @property({ type: Boolean })
  private printing: boolean = false;

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
          flex: 1 1 600px; /*  Stretching: */ /*
          flex: 0 1 600px; /*  No stretching: */ /*
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
            ${Object.entries(this.sortboxData).map(([key, sortbox]) =>
              this.getSortboxDataSize(key) > 0
                ? html` <div class="sb">
                    <header
                      style="--cl: ${sortbox.colour}; --tx: ${getTextColor(
                        sortbox.colour
                      )}"
                    >
                      <span class="al">${sortbox.name}</span>
                      <span class="ar">${key}</span>
                    </header>
                    <main>
                      ${this.getSortboxData(key).map(
                        (item) => html`
                          <div class="row">
                            <span class="al">${item.name}</span>
                            <span class="ar it">${item.round}</span>
                          </div>
                        `
                      )}
                      <p>${this.getPostcodes(key)}</p>
                    </main>
                    <footer>${sortbox.notes}</footer>
                  </div>`
                : ""
            )}
          </div>`
        : html`
            <div class="cards">
              ${Object.entries(this.sortboxData).map(([key, sortbox]) =>
                this.getSortboxDataSize(key) > 0
                  ? html` <div class="sb">
                      <header
                        style="--cl: ${sortbox.colour}; --tx: ${getTextColor(
                          sortbox.colour
                        )}"
                      >
                        <span class="al">${sortbox.name}</span>
                        <span class="ar">${key}</span>
                      </header>
                      <main>
                        ${this.getSortboxData(key).map(
                          (item) => html`
                            <div class="row">
                              <span class="al">${item.name}</span>
                              <span class="ar it">${item.round}</span>
                            </div>
                          `
                        )}
                        <p>${this.getPostcodes(key)}</p>
                      </main>
                      <footer>${sortbox.notes}</footer>
                    </div>`
                  : ""
              )}
            </div>
          `}
    `;
  }

  protected firstUpdated(_changedProperties: any) {
    this.mergeTheData(this.assignedData, this.streetInfoData);
  }

  private getSortboxDataSize(key: string) {
    const data = this.griddata.filter((item) => {
      return item.sb === key;
    });
    return data.length;
  }

  private getSortboxData(key: string) {
    const data = this.griddata.filter((item) => {
      return item.sb === key;
    });
    // Strip postcode from String
    data.map((item) => {
      const rx = ", " + item.pc;
      // Remove Postcode
      const items = item.name.replace(rx, "").split(",");
      // Strip Town
      items.pop();
      item.name = items.join(", ");
    });
    const uniqueStreets = [
      ...new Set(data.map((item) => item.name + ":" + item.round)),
    ];
    const streets: Array<{ name: string; round: string }> = [];
    uniqueStreets.map((street) => {
      const [name, round] = street.split(":");
      streets.push({ name: name, round: round });
    });

    return streets.sort((left, right) => compareStreet(left.name, right.name));
  }

  private getPostcodes(key: string) {
    const data = this.griddata.filter((item) => {
      return item.sb === key;
    });
    const uniquePostcodes = [...new Set(data.map((item) => item.pc))];
    return uniquePostcodes.sort(compareStreet).join(", ");
  }

  updated(changedProps: PropertyValues) {
    console.log(changedProps);
    if (
      changedProps.has("data") ||
      changedProps.has("assignedData") ||
      changedProps.has("streetInfoData") ||
      changedProps.has("sortboxData")
    ) {
      this.mergeTheData(this.assignedData, this.streetInfoData);
    }
  }

  stateChanged(state: RootState) {
    if (this.drawopened !== state.app!.drawerOpened) {
      this.drawopened = state.app!.drawerOpened;
      if (this.grid !== null) {
        if (this.drawopened) {
          this.grid.setAttribute("drawopened", "");
        } else {
          this.grid.removeAttribute("drawopened");
        }
      }
    }

    if (state.app!.page === "sortboxes") {
      const streetMapState = streetMapSelector(state);
      this.streetInfoData = streetMapState!._streetInfo;

      const groupdataState = groupdataSelector(state);
      this.assignedData = groupdataState!._assignedData;
      this.sortboxData = groupdataState!._sortboxData;

      this.mergeTheData(this.assignedData, this.streetInfoData);
    }
  }

  private getNames(view: AllowedViews, item: PublicStreet) {
    const names = [];
    switch (+view) {
      case AllowedViews.English:
        names.push(item.name);
        break;
      case AllowedViews.Welsh:
        if (item.wname !== undefined) {
          names.push(item.wname);
        } else {
          names.push(item.name);
        }
        break;

      default:
        names.push(item.name);
        if (item.wname !== undefined) {
          names.push(item.wname);
        }
    }
    return names;
  }

  private mergeTheData(
    assignedData: AssignedData,
    streetInfoData: StreetInfoData
  ) {
    const griddata: Array<GridData> = [];

    if (
      assignedData !== undefined &&
      streetInfoData !== undefined &&
      this.data !== null
    ) {
      for (const [pc, item] of Object.entries(assignedData)) {
        const pci = this.data[pc];
        const streetInfo = streetInfoData[pc];

        const names = this.getNames(AllowedViews.Both, pci);

        for (const name of names) {
          this.AddToList(item, name, pc, streetInfo, griddata);
        }
      }
      this.griddata = griddata.sort((left, right) =>
        streetNameCompare(left.name, right.name)
      );
    }
  }

  private AddToList(
    item: AssignedDataItem,
    name: string,
    pc: string,
    streetInfo: StreetInfoItem,
    griddata: GridData[]
  ) {
    const index = item.sortbox === undefined ? 0 : item.sortbox;
    const thisitem: GridData = {
      round: item.key,
      colour: this.sortboxData[index].colour,
      name: name,
      pc: pc,
      sb: item.sortbox,
    };

    if (streetInfo !== undefined) {
      thisitem.firstHouse = streetInfo.firstHouse;
      thisitem.lastHouse = streetInfo.lastHouse;
      thisitem.notes = streetInfo.notes;
      thisitem.streetOrder = streetInfo.streetOrder;
      thisitem.numberOfProperties = streetInfo.numberOfProperties;
    }
    griddata.push(thisitem);
  }
}
*/
