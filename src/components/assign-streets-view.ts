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
  LitElement,
  property,
  PropertyValues,
  internalProperty,
} from "lit-element";
import "@material/mwc-select";
import "@material/mwc-list/mwc-list-item";
import "./snack-bar";

// These are the shared styles needed by this element.
import { SharedStyles } from "./shared-styles";
import { connect } from "pwa-helpers/connect-mixin";

// This element is connected to the Redux store.
import { store, RootState } from "../store";

// These are the actions needed by this element.
import {
  GroupDataItem,
  GroupData,
  GroupFilter,
} from "../actions/groupdata";
import { PolygonData, PolygonDataItem } from "../actions/polygondata";
import { PublicStreetData } from "../actions/publicstreet";
import { StreetInfoData } from "../actions/streetmap";
import { notifyMessage } from "../actions/app";
import { AssignedData, assignedDataUpdateGroup } from "../actions/assignedData";
import { roundDataUpdateRound } from "../actions/roundsdata";
import './edit-map';
import { Polygon } from "./polygons";


let selectedGroup: GroupDataItem;

let admin: boolean = false;

@customElement("assign-streets-view")
export class AssignStreetsView extends connect(store)(LitElement) {
  @query("#mapid")
  private mapid: any;

  @property({ type: Boolean, reflect: true })
  private drawopened: boolean = false;

  @property({ type: Object })
  private data: PublicStreetData = {};

  @property({ type: Object })
  private streetInfoData: StreetInfoData = {};

  @property({ type: Object })
  private groupData: GroupData = {};

  @property({ type: String })
  private changedIndex: string = "";

  @property({ type: Object })
  private polygon: Polygon = { type: "Polygon", coordinates: [] };

  @property({ type: Object })
  private polygonData: PolygonData = {};

  @property({ type: Object })
  private assignedData: AssignedData = {};

  @property({ type: Boolean })
  private admin: boolean = false;

  @property({ type: Object })
  private groupFilter: GroupFilter = {};

  @property({ type: Object })
  private selectedGroup: GroupDataItem = {
    _id: "",
    name: "",
    notes: "",
    contactDetails: "",
    colour: "",
  };

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
          display: block;
        }
      `,
    ];
  }

  protected render() {
    return html`   <edit-map
    editMarkers
    id="map"
    .polygonData=${this.polygonData}
    .options=${this._mapOptions}
  ></edit-map>
`;
  }

  protected firstUpdated(_changedProperties: any) {
    // Create the map
  }

  updated(changedProps: PropertyValues) {
    if (changedProps.has("selectedGroup")) {
      selectedGroup = this.selectedGroup;
    }

    if (
      changedProps.has("groupData") ||
      changedProps.has("groupFilter") ||
      changedProps.has("assignedData") ||
      changedProps.has("polygonData") ||
      changedProps.has("changedIndex") ||
      changedProps.has("polygon")
    ) {
      if (this.changedIndex !== "") {
        this.polygonData[this.changedIndex].polygon = this.polygon;
      }
      drawStreets(
        this.changedIndex,
        this.groupData,
        this.groupFilter,
        this.assignedData,
        this.polygonData,
        this.streetInfoData,
        this.data
      );
    }

    admin = this.admin;
  }

  stateChanged(state: RootState) {}
}

function getPolygonLayer(pc: string) {
}

function drawStreets(
  changedIndex: string,
  groupData: GroupData,
  groupFilter: GroupFilter,
  assignedData: AssignedData,
  polygonData: PolygonData,
  streetInfoData: StreetInfoData,
  data: PublicStreetData
) {
    }

function removeLayer() {
}

function lookupPublicStreet(postcode: string, data: PublicStreetData) {
  return data[postcode].name;
}

function lookupStreetInfo(pc: string, streetInfoData: StreetInfoData) {
  let info = "";
  const streetInfo = streetInfoData[pc];
  if (streetInfo !== undefined) {
    info =
      "<br><b>First house: </b>" +
      streetInfo.firstHouse +
      "<br><b>Last house: </b>" +
      streetInfo.lastHouse +
      "<br><b>Number of properties: </b>" +
      streetInfo.numberOfProperties +
      "<br><b>Street order: </b>" +
      streetInfo.streetOrder;
  }

  return info;
}

function DrawNewPolygon(
  groupData: GroupData,
  groupKey: string,
  pc: string,
  item: PolygonDataItem,
  streetInfoData: StreetInfoData,
  data: PublicStreetData
) {
  const groupDataItem = groupData[groupKey];
  const label =
    "<b>" +
    groupDataItem.name +
    ":</b> " +
    lookupPublicStreet(pc, data) +
    lookupStreetInfo(pc, streetInfoData);
}

function _layerClick(el: any) {
  if (selectedGroup._id !== "") {
    const target = el.target;
    target.setStyle({ color: selectedGroup.colour });

    // Change the tooltip
    const parts = target.getTooltip().getContent().split(":");
    target.setTooltipContent(selectedGroup.name + ": " + parts[1]);

    // Update group and street
    const layer = target.getLayers()[0];
    const key = layer.feature.id;
    if (admin) {
      store.dispatch(assignedDataUpdateGroup(key, selectedGroup._id));
    } else {
      store.dispatch(roundDataUpdateRound(key, selectedGroup._id));
    }
  } else {
    store.dispatch(notifyMessage("Select round to assign"));
  }
}
