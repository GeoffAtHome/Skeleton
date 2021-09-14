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

// This element is connected to the Redux store.
import { store, RootState } from '../store';

import '@material/mwc-dialog';
import '@material/mwc-textfield';
import '@material/mwc-button';

import './edit-map';
import './loading-spinner';
import { labelIcon } from './my-icons';

// These are the actions needed by this element.
import {
  postBoxDataLoad,
  PostBoxList,
  PostBoxData,
  postBoxUpdate,
  postBoxAdd,
  postBoxCancelEdit,
  postBoxDelete,
  postBoxEdit,
} from '../actions/postboxes';

// We are lazy loading its reducer.
import postBoxState, { postboxSelector } from '../reducers/postboxes';
import syncState, { syncStateSelector } from '../reducers/syncState';
import { MarkerData } from './Markers';
import { PageViewElement } from './page-view-element';
import { NotifyStatus } from '../reducers/PouchDBStatus';
import { fullyLoaded } from '../actions/syncState';
import { postboxURL } from '../reducers/dbconst';

if (postboxSelector(store.getState()) === undefined) {
  store.addReducers({
    postBoxState,
  });
}
if (syncStateSelector(store.getState()) === undefined) {
  store.addReducers({ syncState });
}

const publicDB: Array<string> = [postboxURL];
const userDB: Array<string> = [];

let postBoxData: PostBoxList = {};
let newPostBoxItem: PostBoxData;

function _moveMarker(el: any) {
  const { detail } = el;
  const { key } = detail;
  const postBox: PostBoxData = postBoxData[key];
  postBox.pos = { ...detail.pos };
  store.dispatch(postBoxUpdate(key, postBox));
}

function _MarkerClick(el: any) {
  const markerClicked = el.detail.key;
  store.dispatch(postBoxEdit(markerClicked));
}

@customElement('edit-postbox-view')
export class EditPostboxView extends connect(store)(PageViewElement) {
  @query('#map')
  private map: any;

  @query('#editPostbox')
  private dialog: any;

  @query('#name')
  private editName: any;

  @query('#addUpdate')
  private addUpdate: any;

  @query('#address')
  private editAddress: any;

  @query('#opening')
  private editOpening: any;

  @query('#notes')
  private editNotes: any;

  @query('#lng')
  private editLng: any;

  @query('#lat')
  private editLat: any;

  @property({ type: Boolean })
  private _loading = true;

  @property({ type: String })
  private postBoxDataStatus = '';

  private _mapOptions = {
    center: { lat: 51.50502153288204, lng: -3.240311294225257 },
    zoom: 10,
  };

  private _markerData: MarkerData = {};

  private addPostbox: boolean = false;

  private newPostbox: boolean = false;

  private mapPos: google.maps.LatLngLiteral = {
    lat: 51.50502153288204,
    lng: -3.240311294225257,
  };

  private editPostBox: string = '';

  static get styles() {
    return [
      SharedStyles,

      css`
        :host {
          display: flex;
          align-items: flex-start;
          height: 100%;
        }

        #map {
          width: 100%;
          height: 80vh;
        }

        #label {
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
      <loading-spinner ?loading="${this._loading}"></loading-spinner>
      <mwc-dialog id="editPostbox" heading="Postbox" scrimClickAction="">
        <div>
          <div>
            <mwc-textfield
              type="text"
              id="name"
              label="Name"
              required
              autocomplete
              validationMessage="Name required"
            ></mwc-textfield>
          </div>
          <div>
            <mwc-textfield
              type="text"
              id="address"
              label="Address"
              autocomplete
              validationMessage="Address required"
              required
            ></mwc-textfield>
          </div>
          <div>
            <mwc-textfield
              type="text"
              id="opening"
              label="Opening times"
              autocomplete
              validationMessage="Opening times required"
              required
            ></mwc-textfield>
          </div>
          <div>
            <mwc-textfield type="text" id="notes" label="Notes"></mwc-textfield>
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
          ${this.addPostbox !== true
            ? html` <div>
                <mwc-button dialogAction="delete" @click="${this.deleteLabel}"
                  >delete</mwc-button
                >
              </div>`
            : html``}
        </div>
        <mwc-button
          id="addUpdate"
          slot="secondaryAction"
          @click="${this.updateLabel}"
          >Update</mwc-button
        >
        <mwc-button slot="primaryAction" @click="${this.cancelLabel}"
          >Close</mwc-button
        >
      </mwc-dialog>
      <mwc-button id="label" raised @click="${this.addLabel}"
        >${labelIcon}</mwc-button
      >
      <edit-map
        editMarkers
        id="map"
        .options=${this._mapOptions}
        .markerData=${this._markerData}
      ></edit-map>
    `;
  }

  drawLabels(thePostBoxData: PostBoxList) {
    const markerData: MarkerData = {};
    for (const [_key, item] of Object.entries(thePostBoxData)) {
      if (item.pos) {
        markerData[_key] = {
          position: item.pos,
          title: item.description.name,
          shape:
            '<svg viewBox="-162 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m25.601562 187.734375h136.53125v250.195313h-136.53125zm0 0" stroke="black" fill="#c81e1e"/><path d="m25.601562 187.734375h110.933594v250.195313h-110.933594zm0 0" fill="#f44335"/><path d="m25.601562 426.667969h136.53125c4.714844 0 8.535157 3.820312 8.535157 8.53125v59.734375c0 4.710937-3.820313 8.53125-8.535157 8.53125h-136.53125c-4.714843 0-8.535156-3.820313-8.535156-8.53125v-59.734375c0-4.710938 3.820313-8.53125 8.535156-8.53125zm0 0" fill="#37474f"/><path d="m25.601562 426.667969h110.933594c4.710938 0 8.53125 3.820312 8.53125 8.53125v59.734375c0 4.710937-3.820312 8.53125-8.53125 8.53125h-110.933594c-4.714843 0-8.535156-3.820313-8.535156-8.53125v-59.734375c0-4.710938 3.820313-8.53125 8.535156-8.53125zm0 0" fill="#607d8b"/><path d="m25.601562 119.464844h136.53125v68.269531h-136.53125zm0 0" fill="#c81e1e"/><path d="m25.601562 119.464844h110.933594v68.269531h-110.933594zm0 0" fill="#f44335"/><path d="m25.601562 61.183594h136.53125v61.097656h-136.53125zm0 0" fill="#c81e1e"/><path d="m25.601562 61.183594h110.933594v61.097656h-110.933594zm0 0" fill="#f44335"/><path d="m179.199219 38.398438v12.800781h-170.664063v-12.800781c0-14.933594 31.484375-27.390626 72.53125-29.523438 4.179688-.257812 8.449219-.339844 12.800782-.339844 47.101562 0 85.332031 13.394532 85.332031 29.863282zm0 0" fill="#c81e1e"/><path d="m153.601562 38.398438v12.800781h-145.066406v-12.800781c0-14.933594 31.484375-27.390626 72.53125-29.523438 41.046875 2.132812 72.535156 14.589844 72.535156 29.523438zm0 0" fill="#f44335"/><path d="m179.199219 42.667969v25.597656c-.011719 4.707031-3.824219 8.519531-8.53125 8.535156h-153.601563c-4.707031-.015625-8.519531-3.828125-8.53125-8.535156v-25.597656zm0 0" fill="#bb193b"/><path d="m153.601562 42.667969v25.597656c-.015624 4.707031-3.828124 8.519531-8.535156 8.535156h-128c-4.707031-.015625-8.519531-3.828125-8.53125-8.535156v-25.597656zm0 0" fill="#ef314c"/><path d="m68.265625 230.398438v51.203124h51.199219v-51.203124zm0 0" fill="#fdd834"/><path d="m68.265625 230.398438v51.203124h34.132813v-51.203124zm0 0" fill="#ffeb3a"/><path d="m162.132812 435.199219h-136.53125c-4.714843 0-8.535156-3.820313-8.535156-8.53125v-238.933594c0-4.714844 3.820313-8.535156 8.535156-8.535156h136.53125c4.714844 0 8.535157 3.820312 8.535157 8.535156v238.933594c0 4.710937-3.820313 8.53125-8.535157 8.53125zm-128-17.066407h119.46875v-221.867187h-119.46875zm0 0"/><path d="m162.132812 512h-136.53125c-9.421874-.007812-17.058593-7.644531-17.066406-17.066406v-59.734375c.007813-9.421875 7.644532-17.054688 17.066406-17.066407h136.53125c9.421876.011719 17.058594 7.644532 17.066407 17.066407v59.734375c-.007813 9.421875-7.644531 17.058594-17.066407 17.066406zm-136.53125-76.800781v59.734375h136.542969l-.011719-59.734375zm0 0"/><path d="m170.667969 196.265625h-153.601563c-4.710937 0-8.53125-3.820313-8.53125-8.53125 0-4.714844 3.820313-8.535156 8.53125-8.535156h153.601563c4.710937 0 8.53125 3.820312 8.53125 8.535156 0 4.710937-3.820313 8.53125-8.53125 8.53125zm0 0"/><path d="m170.667969 128h-153.601563c-4.710937 0-8.53125-3.820312-8.53125-8.535156 0-4.710938 3.820313-8.53125 8.53125-8.53125h153.601563c4.710937 0 8.53125 3.820312 8.53125 8.53125 0 4.714844-3.820313 8.535156-8.53125 8.535156zm0 0"/><path d="m162.132812 196.265625h-136.53125c-4.714843 0-8.535156-3.820313-8.535156-8.53125v-68.269531c0-4.710938 3.820313-8.53125 8.535156-8.53125h136.53125c4.714844 0 8.535157 3.820312 8.535157 8.53125v68.269531c0 4.710937-3.820313 8.53125-8.535157 8.53125zm-128-17.066406h119.46875v-51.199219h-119.46875zm0 0"/><path d="m162.132812 128h-136.53125c-4.714843 0-8.535156-3.820312-8.535156-8.535156v-42.664063c0-4.714843 3.820313-8.535156 8.535156-8.535156h136.53125c4.714844 0 8.535157 3.820313 8.535157 8.535156v42.664063c0 4.714844-3.820313 8.535156-8.535157 8.535156zm-128-17.066406h119.46875v-25.601563h-119.46875zm0 0"/><path d="m179.199219 85.332031h-170.664063c-4.714844 0-8.535156-3.820312-8.535156-8.53125v-38.402343c0-25.207032 47.222656-38.398438 93.867188-38.398438 46.644531 0 93.867187 13.191406 93.867187 38.398438v38.402343c0 4.710938-3.820313 8.53125-8.535156 8.53125zm-162.132813-17.066406h153.601563v-29.867187c0-7.519532-29.160157-21.332032-76.800781-21.332032-47.640626 0-76.800782 13.8125-76.800782 21.332032zm0 0"/><path d="m119.464844 162.132812h-51.199219c-4.710937 0-8.53125-3.820312-8.53125-8.53125 0-4.714843 3.820313-8.535156 8.53125-8.535156h51.199219c4.714844 0 8.535156 3.820313 8.535156 8.535156 0 4.710938-3.820312 8.53125-8.535156 8.53125zm0 0"/><path d="m119.464844 298.667969h-51.199219c-9.421875-.011719-17.054687-7.644531-17.066406-17.066407v-51.203124c.011719-9.421876 7.644531-17.054688 17.066406-17.066407h51.199219c9.421875.011719 17.058594 7.644531 17.070312 17.066407v51.203124c-.011718 9.421876-7.648437 17.054688-17.070312 17.066407zm-51.199219-68.269531v51.203124h51.214844l-.015625-51.203124zm0 0"/><path d="m128 341.332031c-4.710938 0-8.535156-3.820312-8.535156-8.53125v-8.535156c0-4.710937 3.824218-8.53125 8.535156-8.53125s8.535156 3.820313 8.535156 8.53125v8.535156c0 4.710938-3.824218 8.53125-8.535156 8.53125zm0 0"/><path d="m179.199219 51.199219h-170.664063c-4.714844 0-8.535156-3.820313-8.535156-8.53125 0-4.714844 3.820312-8.535157 8.535156-8.535157h170.664063c4.714843 0 8.535156 3.820313 8.535156 8.535157 0 4.710937-3.820313 8.53125-8.535156 8.53125zm0 0"/><path d="m42.667969 76.800781c-2.261719-.035156-4.421875-.917969-6.058594-2.476562-.753906-.828125-1.359375-1.78125-1.792969-2.816407-.90625-2.066406-.90625-4.417968 0-6.484374.78125-2.140626 2.46875-3.824219 4.609375-4.609376 2.078125-.847656 4.40625-.847656 6.484375 0 2.140625.78125 3.828125 2.46875 4.605469 4.609376.914063 2.066406.914063 4.421874 0 6.484374-.433594 1.035157-1.039063 1.988282-1.789063 2.816407-1.636718 1.558593-3.800781 2.441406-6.058593 2.476562zm0 0"/><path d="m76.800781 76.800781c-1.117187-.015625-2.21875-.246093-3.242187-.683593-2.144532-.78125-3.828125-2.464844-4.609375-4.609376-.90625-2.066406-.90625-4.417968 0-6.484374.410156-1.042969 1.019531-2 1.792969-2.816407 3.347656-3.320312 8.753906-3.3125 12.089843.027344 3.339844 3.335937 3.347657 8.742187.027344 12.089844-1.628906 1.570312-3.796875 2.457031-6.058594 2.476562zm0 0"/><path d="m110.933594 76.800781c-.570313-.019531-1.140625-.078125-1.707032-.171875-.535156-.09375-1.050781-.265625-1.535156-.511718-.542968-.1875-1.0625-.445313-1.535156-.769532-.429688-.339844-.855469-.679687-1.28125-1.023437-.339844-.425781-.683594-.851563-1.023438-1.277344-.324218-.476563-.582031-.992187-.769531-1.539063-.246093-.480468-.417969-1-.511719-1.535156-.09375-.5625-.152343-1.132812-.171874-1.707031.03125-2.257813.917968-4.421875 2.476562-6.058594 2.472656-2.382812 6.117188-3.085937 9.300781-1.792969 1.035157.433594 1.984375 1.042969 2.816407 1.792969 1.558593 1.636719 2.441406 3.800781 2.472656 6.058594-.019532.574219-.074219 1.144531-.167969 1.707031-.097656.535156-.269531 1.050782-.511719 1.535156-.1875.546876-.445312 1.0625-.769531 1.539063-.316406.445313-.65625.871094-1.023437 1.277344-1.636719 1.558593-3.800782 2.441406-6.058594 2.476562zm0 0"/><path d="m145.066406 76.800781c-.570312-.019531-1.140625-.078125-1.707031-.171875-.535156-.09375-1.050781-.265625-1.535156-.511718-.542969-.1875-1.058594-.445313-1.535157-.769532-.425781-.339844-.855468-.679687-1.28125-1.023437-3.300781-3.363281-3.300781-8.75 0-12.117188.425782-.339843.855469-.683593 1.28125-1.023437.476563-.320313.992188-.578125 1.535157-.769532.484375-.246093 1-.417968 1.535156-.511718 2.8125-.558594 5.714844.304687 7.765625 2.304687.769531.816407 1.378906 1.773438 1.792969 2.816407.910156 2.066406.910156 4.421874 0 6.484374-1.230469 3.253907-4.375 5.375-7.851563 5.292969zm0 0"/></svg>',
        };
      }
    }
    this._markerData = markerData;
  }

  protected firstUpdated(_changedProperties: any) {
    store.dispatch(postBoxDataLoad());
    this.map.addEventListener('moveMap', this._moveMap);
    this.map.addEventListener('moveMarker', _moveMarker);
    this.map.addEventListener('clickedMarker', _MarkerClick);
  }

  updated(changedProps: PropertyValues) {
    if (changedProps.has('postBoxDataStatus'))
      NotifyStatus('post box data', this.postBoxDataStatus);
  }

  stateChanged(state: RootState) {
    if (this.active) {
      const _syncState = syncStateSelector(state);
      this._loading = fullyLoaded(publicDB, userDB, '', _syncState!._docs);

      const postboxState = postboxSelector(state);
      postBoxData = { ...postboxState!._data };
      this.postBoxDataStatus = postboxState!._loadingStatus;
      this.drawLabels(postBoxData);

      if (postboxState!._postBoxKey !== '') {
        this.editPostBox = postboxState!._postBoxKey;
        newPostBoxItem = postBoxData[this.editPostBox];
        this.addPostbox = false;
        this.addUpdate.textContent = 'Update';
        this.showEditLabelDialog('Edit Postbox', newPostBoxItem);
      }
    }
  }

  private showEditLabelDialog(title: string, postbox: PostBoxData) {
    this.dialog.setAttribute('heading', title);
    this.editName.value = postbox.description.name;
    this.editAddress.value = postbox.description.address;
    this.editOpening.value = postbox.description.openingTimes;
    this.editNotes.value = postbox.description.notes;
    this.editLng.value = postbox.pos.lng;
    this.editLat.value = postbox.pos.lat;
    this.dialog.show();
  }

  private addLabel(_el: Event) {
    const { mapPos } = this;
    const blankLabel = {
      pos: mapPos,
      description: {
        name: '',
        address: '',
        openingTimes: '',
        notes: '',
      },
    };

    newPostBoxItem = blankLabel;
    this.addPostbox = true;
    this.newPostbox = true;
    this.addUpdate.textContent = 'Add';
    this.showEditLabelDialog('Add Postbox', newPostBoxItem);
  }

  private closeDialog() {
    this.dialog.close();
  }

  private updateLabel() {
    if (
      this.editName.checkValidity() &&
      this.editAddress.checkValidity() &&
      this.editOpening.checkValidity()
    ) {
      newPostBoxItem.description.name = this.editName.value;
      newPostBoxItem.description.address = this.editAddress.value;
      newPostBoxItem.description.openingTimes = this.editOpening.value;
      newPostBoxItem.description.notes = this.editNotes.value;
      this.closeDialog();

      if (this.newPostbox) {
        store.dispatch(postBoxAdd(Date.now().toString(), newPostBoxItem));
      } else {
        store.dispatch(postBoxUpdate(this.editPostBox, newPostBoxItem));
      }
    }
  }

  private cancelLabel() {
    this.closeDialog();
    store.dispatch(postBoxCancelEdit());
  }

  private deleteLabel() {
    this.closeDialog();
    store.dispatch(postBoxDelete(this.editPostBox, newPostBoxItem));
  }

  private _moveMap = (e: any) => {
    this.mapPos = e.detail.position;
  };
}
