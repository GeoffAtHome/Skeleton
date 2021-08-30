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
import { connect } from 'pwa-helpers/connect-mixin';
import { SharedStyles } from './shared-styles';

import { PageViewElement } from './page-view-element';

// These are the elements needed by this element.
import '@material/mwc-dialog';
import '@material/mwc-textfield';
import '@material/mwc-button';
import '@material/mwc-select';
import '@material/mwc-list/mwc-list-item';
import './edit-map';

// This element is connected to the Redux store.
import { store, RootState } from '../store';

// These are the actions needed by this element.
import {
  labelDataAddLabel,
  labelDataDeleteLabel,
  labelDataUpdateLabel,
  ILabel,
  labelDataLoad,
  labelDataMoveLabel,
} from '../actions/labeldata';
import {
  polygonDataLoad,
  polygonDataUpdatePolygon,
} from '../actions/polygondata';
import {
  StreetInfoData,
  StreetInfoItem,
  streetInfoLoad,
  streetInfoUpdate,
} from '../actions/streetInfo';

// We are lazy loading its reducer.
import labelData, { labelDataSelector } from '../reducers/labeldata';
import polygonData, { polygonDataSelector } from '../reducers/polygondata';
import { NotifyStatus } from '../reducers/PouchDBStatus';
import streetInfoData, { streetInfoDataSelector } from '../reducers/streetInfo';
import { userDataSelector } from '../reducers/users';

import { pathEditIcon, labelIcon, detailsIcon } from './my-icons';
import { EditMapData, EditMapDataItem, MapPolygon } from './polygons';
import { MarkerData } from './Markers';
import { houseNames } from '../res/houses';
import { streetNames } from '../res/postcodeData';

if (streetInfoDataSelector(store.getState()) === undefined)
  store.addReducers({ streetInfoData });
if (labelDataSelector(store.getState()) === undefined)
  store.addReducers({ labelData });
if (polygonDataSelector(store.getState()) === undefined)
  store.addReducers({ polygonData });

const streetOrder = [
  'Sequential',
  'Odd/Even',
  'Even only',
  'Odd only',
  'Names only',
  'unknown',
];

let newLabel: ILabel;

function modifiedPolygon(_el: CustomEvent<{ pc: string; path: MapPolygon }>) {
  store.dispatch(polygonDataUpdatePolygon(_el.detail.pc, _el.detail.path));
}

function moveMarker(
  _el: CustomEvent<{ key: number; pos: { lat: number; lng: number } }>
) {
  store.dispatch(labelDataMoveLabel(_el.detail.key, 0, _el.detail.pos));
}

function svgText(txt: String, colour: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="30"><text x="0" y="30" style="font-size: 14px;" fill="${colour}">${txt}</text></svg>`;
}

@customElement('map-edit')
export class EditMap extends connect(store)(PageViewElement) {
  @query('#editStreet')
  private editStreetDialog: any;

  @query('#streetOrder')
  private editStreetOrder: any;

  @query('#notes')
  private editStreetNotes: any;

  @query('#firstHouse')
  private editStreetFirstHouse: any;

  @query('#lastHouse')
  private editStreetLastHouse: any;

  @query('#numberOfProperties')
  private editNumberOfProperties: any;

  @query('#editLabel')
  private editLabelDialog: any;

  @query('#addUpdate')
  private addUpdate: any;

  @query('#labelText')
  private editLabelText: any;

  @query('#labelColour')
  private editLabelColour: any;

  @query('#lng')
  private editLng: any;

  @query('#lat')
  private editLat: any;

  @query('#map')
  private map: any;

  private mapPos: any;

  @property({ type: Array })
  private labels: Array<ILabel> = [];

  private polygon: EditMapDataItem = {
    paths: {
      coordinates: [
        [
          [-3.2412792353632085, 51.49987685864883],
          [-3.241330593574048, 51.49989127259969],
        ],
      ],
      type: 'Polygon',
    },
    options: {
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      editable: false,
    },
    text: html``,
  };

  @property({ type: String })
  private streetName: string = '';

  @property({ type: Boolean })
  private addLabel: boolean = false;

  @property({ type: String })
  private polygonDataStatus ='';

  @property({ type: String })
  private streetInfoDataStatus ='';

  @property({ type: Boolean })
  private admin: boolean = false;

  @property({ type: String })
  private groupId = '';

  @property({ type: Boolean })
  private showDetails = false; // True to show the details dialog

  @property({ type: String })
  private index = '';

  private _mapOptions = {
    center: { lat: 51.50502153288204, lng: -3.240311294225257 },
    zoom: 10,
  };

  private _polygon: EditMapData = {};

  private _markerData: MarkerData = {};

  @property({ type: Object })
  private _editPath: { pc: string; state: boolean } = { pc: '', state: false };

  private editPath = false; // True to edit path

  private streetInfoData: StreetInfoData = {};

  static get styles() {
    return [
      SharedStyles,
      css`
        :host {
          display: block;
        }

        .flex-container {
          display: flex;
          flex-flow: row;
          width: 100%;
          height: 100%;
        }
        edit-map-view {
          flex: 3;
          height: 90vh;
        }

        #streetList {
          max-height: 90vh;
          overflow: auto;
          flex: 1;
          list-style-type: none;
        }

        #label {
          position: fixed;
          fill: white;
          bottom: 15px;
          right: 15px;
          z-index: 1;
        }

        #path {
          position: fixed;
          fill: white;
          bottom: 15px;
          right: 100px;
          z-index: 1;
        }

        #detailsButton {
          position: fixed;
          fill: white;
          bottom: 15px;
          right: 185px;
          z-index: 1;
        }

        #map {
          width: 60%;
          height: 80vh;
        }

        mwc-textfield {
          width: 300px;
        }

        li:nth-child(even) {
          background: #ccc;
        }
        li:nth-child(odd) {
          background: #fff;
        }
      `,
    ];
  }

  protected render() {
    return html`
      <mwc-dialog
        id="editLabel"
        heading="Edit label"
        @closed="${this.closeEditLabelDialog}"
      >
        <div>
          <div>
            <mwc-textfield
              id="labelText"
              dialogInitialFocus
              label="Text"
              validationMessage="Text required"
              required
            ></mwc-textfield>
          </div>
          <div>
            <mwc-textfield
              id="labelColour"
              type="color"
              label="Colour"
              required
            ></mwc-textfield>
          </div>
          <div>
            <p>To change label position drag the label on the map</p>
          </div>
          <div>
            <mwc-textfield disabled id="lng" label="Longitude"></mwc-textfield>
          </div>
          <div>
            <mwc-textfield disabled id="lat" label="Latitude"></mwc-textfield>
          </div>
          ${this.addLabel !== true
            ? html` <div>
                <mwc-button dialogAction="delete">delete</mwc-button>
              </div>`
            : html``}
        </div>
        <mwc-button id="addUpdate" slot="primaryAction" dialogAction="update"
          >Update</mwc-button
        >
        <mwc-button slot="secondaryAction" dialogAction="cancel"
          >Cancel</mwc-button
        >
      </mwc-dialog>
      <mwc-dialog
        id="editStreet"
        heading="Edit Street"
        @closed="${this.closeEditStreetDialog}"
      >
        <div id="streetList">
          <h3>${this.streetName}</h3>
          <div>
            <mwc-select id="streetOrder" label="Street order">
              ${streetOrder.map(
                i => html`<mwc-list-item value="${i}">${i}</mwc-list-item>`
              )}
            </mwc-select>
          </div>
          <div>
            <mwc-textfield
              id="firstHouse"
              type="number"
              label="First house"
            ></mwc-textfield>
          </div>
          <div>
            <mwc-textfield
              id="lastHouse"
              type="number"
              label="Last house"
            ></mwc-textfield>
          </div>
          <div>
            <mwc-textfield
              readonly
              id="numberOfProperties"
              type="number"
              label="Number of Properties"
            ></mwc-textfield>
          </div>
          <div>
            <mwc-textfield id="notes" label="Notes"></mwc-textfield>
          </div>
        </div>
        <mwc-button slot="primaryAction" dialogAction="update"
          >Update</mwc-button
        >
        <mwc-button slot="secondaryAction" dialogAction="cancel"
          >Cancel</mwc-button
        >
      </mwc-dialog>

      <mwc-button
        id="detailsButton"
        aria-label="Street details"
        raised
        @click="${this.details}"
        >${detailsIcon}</mwc-button
      >
      <mwc-button
        id="label"
        aria-label="Add label"
        raised
        @click="${this.addLabelDialog}"
        >${labelIcon}</mwc-button
      >
      <mwc-button
        id="path"
        aria-label="Edit path"
        raised
        @click="${this.clickEditPath}"
        >${pathEditIcon}</mwc-button
      >
      <div class="flex-container">
        <ul id="streetList">
          ${Object.entries(houseNames[this.index]).map(
            i => html`<li>${i[1]}, ${this.streetName}</li>`
          )}
        </ul>
        <edit-map
          id="map"
          .options=${this._mapOptions}
          .markerData=${this._markerData}
          .polygonData=${this._polygon}
          .editPolygon=${this._editPath}
          .editMarkers=${true}
        ></edit-map>
      </div>
    `;
  }

  firstUpdated(changedProps: PropertyValues) {
    this.map.addEventListener('modifiedPolygon', modifiedPolygon);
    this.map.addEventListener('clickedMarker', this.clickedMarker);
    this.map.addEventListener('moveMarker', moveMarker);
    // this.map.addEventListener('moveMap', moveMap);
  }

  updated(changedProps: PropertyValues) {
    if (changedProps.has('polygonDataStatus'))
      NotifyStatus('Polygon data', this.polygonDataStatus);

    if (changedProps.has('streetInfoDataStatus'))
      NotifyStatus('Street info data', this.streetInfoDataStatus);

    if (changedProps.has('admin') || changedProps.has('groupId')) {
      store.dispatch(polygonDataLoad());
      store.dispatch(labelDataLoad(this.admin, this.groupId));
      store.dispatch(streetInfoLoad());
    }

    if (changedProps.has('index')) {
      this.editPath = false;
      this._mapOptions = {
        center: this.mapPos,
        zoom: 18,
      };
      this.streetName = streetNames[this.index].name;

      this._polygon = {};
      this._polygon[this.index] = this.polygon;
    }

    if (changedProps.has('showDetails')) {
      this.showDetailsDialog();
    }
  }

  stateChanged(state: RootState) {
    if (state.app!.page === 'mapEdit') {
      const usersState = userDataSelector(state);
      this.admin = usersState!._newUser.claims.administrator;
      this.groupId = usersState!._newUser.claims.group;

      const polygonState = polygonDataSelector(state);
      this.index = polygonState!._index;
      this.polygon = {
        paths: polygonState!._polygon,
        options: {
          editable: true,
        },
        text: html``,
      };

      this.mapPos = { lat: polygonState!._pos[0], lng: polygonState!._pos[1] };

      const streetInfoState = streetInfoDataSelector(state);
      this.streetInfoData = streetInfoState!._streetInfo;

      const labelDataState = labelDataSelector(state);
      this.labels = labelDataState!._label;
      if (this.labels.length > 0) {
        this._markerData[this.index] = {
          position: this.labels[0].latlng,
          title: this.labels[0].text,
          shape: svgText(this.labels[0].text, this.labels[0].colour),
        };

        if (labelDataState!._editLabel !== -1) {
          newLabel = labelDataState!._label[labelDataState!._editLabel];
          this.addLabel = false;
          this.addUpdate.textContent = 'Update';
          this.showEditLabelDialog('Edit Label', newLabel);
        }
      }

      /*
      const streetMapState = streetMapSelector(state);
      if (streetMapState) {
        index = streetMapState._index;
        if (this.data !== null) {
          this.streetName = this.data[index].name;
        }

        if (streetMapState._displayDetailsDialog === true) {
          let item = streetMapState._streetInfo[index];
          if (item === undefined) {
            item = {
              firstHouse: '',
              lastHouse: '',
              notes: '',
              streetOrder: 'unknown',
              numberOfProperties: 0,
            };
          }
          this.showEditStreetDialog(item);
        }

        this._editPath = streetMapState._editPath;
      } */
    }
  }

  private showEditLabelDialog(title: string, label: ILabel) {
    this.editLabelDialog.setAttribute('heading', title);
    this.editLabelText.value = label.text;
    this.editLng.value = label.latlng.lng;
    this.editLat.value = label.latlng.lat;
    this.editLabelColour.value = label.colour;

    this.map.removeAttribute('foreground');
    this.editLabelDialog.show();
  }

  private showEditStreetDialog(item: StreetInfoItem) {
    this.editStreetNotes.value = item.notes;
    this.editStreetFirstHouse.value = item.firstHouse;
    this.editStreetLastHouse.value = item.lastHouse;
    this.editNumberOfProperties.value = item.numberOfProperties;
    this.editStreetOrder.select(streetOrder.indexOf(item.streetOrder));

    this.map.removeAttribute('foreground');
    this.editStreetDialog.show();
  }

  private addLabelDialog(_el: Event) {
    newLabel = {
      text: 'name',
      latlng: { lat: 51.50502153288204, lng: -3.240311294225257 },
      colour: '#00ff00',
    };
    this.addLabel = true;
    this.addUpdate.textContent = 'Add';
    this.showEditLabelDialog('Add Label', newLabel);
  }

  private closeEditLabelDialog(_el: any) {
    if (_el.detail !== null) {
      switch (_el.detail.action) {
        case 'update':
          return this.updateLabel();

        case 'delete':
          return this.deleteLabel();

        default:
          break;
      }
    }
    return this.cancelDialog();
  }

  private closeEditStreetDialog(_el: any) {
    if (_el.detail !== null) {
      switch (_el.detail.action) {
        case 'update':
          return this.updateStreet();

        default:
          break;
      }
    }
    return this.cancelDialog();
  }

  private updateStreet() {
    const streetItem: StreetInfoItem = {
      _id: this.index,
      notes: this.editStreetNotes.value,
      firstHouse: this.editStreetFirstHouse.value,
      lastHouse: this.editStreetLastHouse.value,
      streetOrder: this.editStreetOrder.selectedText,
      numberOfProperties: this.editNumberOfProperties.value,
    };
    this.closeDialog();
    store.dispatch(streetInfoUpdate(streetItem));
  }

  private closeDialog() {
    this.map.setAttribute('foreground', '');
  }

  private cancelDialog() {
    this.closeDialog();
    // store.dispatch(streetMapCancelDialogs());
  }

  private updateLabel() {
    newLabel.text = this.editLabelText.value;
    newLabel.colour = this.editLabelColour.value;
    this.closeDialog();
    if (this.addLabel) {
      store.dispatch(labelDataAddLabel(this.index, newLabel));
    } else {
      const lIndex = Object.keys(this.labels).find(
        (key: any) =>
          this.labels[key].latlng.lat === newLabel.latlng.lat &&
          this.labels[key].latlng.lng === newLabel.latlng.lng
      );
      store.dispatch(labelDataUpdateLabel(this.index, lIndex, newLabel));
    }
  }

  private deleteLabel() {
    store.dispatch(labelDataDeleteLabel(newLabel));
    this.closeDialog();
  }

  private clickEditPath(_el: Event) {
    this.editPath = !this.editPath;
    if (this.editPath) this._editPath = { pc: this.index, state: true };
    else this._editPath = { pc: this.index, state: false };
  }

  private details(_el: Event) {
    this.showDetails = !this.showDetails;
  }

  private showDetailsDialog() {
    const item = this.streetInfoData[this.index];
    this.showEditStreetDialog(item);
  }

  private clickedMarker(
    _el: CustomEvent<{ key: number; marker: google.maps.Marker }>
  ) {
    const label = this.labels[_el.detail.key];
    this.showEditLabelDialog('Edit Label', label);
  }
}
