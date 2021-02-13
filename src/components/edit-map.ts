/**
 * @license
 * Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {
  LitElement,
  html,
  customElement,
  property,
  css,
  PropertyValues,
  internalProperty,
  query,
  TemplateResult,
} from 'lit-element';
import load from './maploader';

import { MarkerData, MarkerDataItem, MarkersOnMap } from './Markers';
import {
  getPath,
  getPathGooglePolygon,
  pathsAreDifferent,
  Polygon,
  PolygonData,
  PolygonDataItem,
  PolygonsOnMap,
} from './polygons';

let map: google.maps.Map;
/**
 * Interface onto the Google Maps API
 *
 * @fires modifiedPolygon -  Dispatched when editing selected polygon has finished.
 * @fires clickedPolygon -  Dispatched when a polygon has been 'clicked'
 *
 */
@customElement('edit-map')
export class EditMap extends LitElement {
  static styles = css`
    :host {
      display: block;
      --popup-background-color: rgba(252, 252, 252, 0.5);
    }

    #mapid {
      height: 100%;
    }

    #popup {
      display: none;
      position: absolute;
      border-radius: 5px;
      box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
      padding: 10px;
    }

    #popup[data-active] {
      display: block;
      background-color: var(--popup-background-color);
    }
  `;

  @query('#popup')
  private popup: HTMLElement | undefined;

  /**
   * The Google map options
   * @type { google.maps.MapOptions }
   */
  @property({ attribute: true, type: Object })
  public options: google.maps.MapOptions = {};

  /**
   * editMarkers - true to edit
   * @type { boolean }
   */
  @property({ attribute: true, type: Boolean })
  public editMarkers = false;

  /**
   * The polygons to draw.
   * Each polygon has a key, path and options
   */
  @property({ type: Object })
  public polygonData: PolygonData | undefined;

  /**
   * The markers to draw.
   * Each marker has a key, title and options
   */
  @property({ type: Object })
  public markerData: MarkerData | undefined;

  /**
   * Polygon to edit
   *
   * @type: {pc: string; state: boolean }
   */
  @property({ type: Object })
  public editPolygon: { pc: string; state: boolean } = { pc: '', state: false };

  /**
   * ShowPopup: show or hide
   */
  @internalProperty()
  private showPopup = '';

  /**
   * LastEditPC: index of last polygon edited
   */
  @internalProperty()
  private LastEditPC = '';

  /**
   * popupText: HTML to display
   */
  @internalProperty()
  private popupText: TemplateResult = html``;

  /**
   * The polygons that have been drawn on the map so that these can be modified.
   */
  @internalProperty()
  private polygonsOnMap: PolygonsOnMap = {};

  /**
   * The markers that have been drawn on the map so that these can be modified.
   */
  @internalProperty()
  private markersOnMap: MarkersOnMap = {};

  render(): TemplateResult {
    return html`
      <div id="mapid"></div>
      <span id="popup" ?data-active="${this.showPopup === 'show'}"
        >${this.popupText}</span
      >
    `;
  }

  protected firstUpdated(): void {
    this.addEventListener('MapsLoaded', () => this.initMap());
    load(this);
  }

  updated(changedProperties: PropertyValues): void {
    // this.shadowRoot!.getElementById('b')?.focus();
    if (map !== undefined) {
      if (changedProperties.has('options')) {
        if (this.options.zoom) map.setZoom(this.options.zoom);
        if (this.options.center) map.setCenter(this.options.center);
      }
      if (changedProperties.has('polygonData')) {
        if (this.polygonData) this.DrawPolygons(this.polygonData);
      }
      if (changedProperties.has('editPolygon')) {
        this.setPolygonEditMode(this.editPolygon);
      }

      if (
        changedProperties.has('markerData') ||
        changedProperties.has('editMarkers')
      ) {
        if (this.markerData)
          this.DrawMarkers(this.markerData, this.editMarkers);
      }
    }
  }

  setPolygonEditMode(editPolygon: { pc: string; state: boolean }): void {
    if (this.LastEditPC !== '') {
      const lastPolygon = this.polygonsOnMap[this.LastEditPC];
      lastPolygon.setEditable(false);
    }

    const polygon = this.polygonsOnMap[editPolygon.pc];
    if (polygon !== undefined) {
      polygon.setEditable(editPolygon.state);
      if (!editPolygon.state) {
        this.fireModifiedPolygon(editPolygon.pc);
      } else {
        this.LastEditPC = editPolygon.pc;
      }
    }
  }

  /**
   * modified polygon event.
   * @event edit-map#modifiedPolygon
   * @type {object}
   * @property {string} pc - id of polygon
   * @property {Polygon} path - polygon path
   */
  fireModifiedPolygon(pc: string): void {
    const polygon = this.polygonsOnMap[pc];
    if (polygon !== undefined) {
      const event = new CustomEvent<{ pc: string; path: Polygon }>(
        'modifiedPolygon',
        {
          detail: {
            pc,
            path: getPathGooglePolygon(polygon),
          },
        }
      );
      this.dispatchEvent(event);
    }
  }

  initMap(): boolean {
    const mid = this.renderRoot.querySelector('#mapid');
    if (mid) {
      // eslint-disable-next-line no-undef
      map = new google.maps.Map(mid, this.options);

      map.addListener('dragend', () => {
        this.moveMap(map);
      });
      map.addListener('zoom_changed', () => {
        this.zoomMap(map);
      });
    }

    if (this.polygonData) this.DrawPolygons(this.polygonData);
    if (this.editPolygon) this.setPolygonEditMode(this.editPolygon);
    if (this.markerData) this.DrawMarkers(this.markerData, this.editMarkers);

    return true;
  }

  zoomMap(theMap: google.maps.Map<Element>): void {
    const center = theMap.getCenter();

    if (center !== undefined) {
      const event = new CustomEvent('zoomMap', {
        detail: {
          position: {
            lat: center.lat(),
            lng: center.lng(),
            zoom: theMap.getZoom(),
          },
        },
      });
      this.dispatchEvent(event);
    }
  }

  moveMap(theMap: google.maps.Map<Element>): void {
    const center = theMap.getCenter();
    const event = new CustomEvent('moveMap', {
      detail: { position: { lat: center.lat(), lng: center.lng() } },
    });
    this.dispatchEvent(event);
  }

  private DrawPolygons(polygonData: PolygonData) {
    for (const [pc, item] of Object.entries(polygonData)) {
      const layer = this.polygonsOnMap[pc];
      if (layer === undefined) {
        // New polygon to draw
        this.DrawPolygon(pc, item);
      } else {
        // Has the polygon changed?
        const oldPath = getPathGooglePolygon(layer);
        if (pathsAreDifferent(oldPath, item.paths)) {
          // Paths are different - so remove the old polygon
          layer.setMap(null);
          // then draw the new
          this.DrawPolygon(pc, item);
        } else if (this.optionsAreDifferent(item.options, layer)) {
          // Have the options changed?
          layer.setOptions(item.options);
        }
      }
    }
    // Finally remove any polygons that are no longer required
    const keys = Object.keys(polygonData);
    // eslint-disable-next-line no-restricted-syntax
    for (const key in this.polygonsOnMap) {
      if (!keys.includes(key)) {
        this.polygonsOnMap[key].setMap(null);
        delete this.polygonsOnMap[key];
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private optionsAreDifferent(
    options: google.maps.PolygonOptions,
    layer: google.maps.Polygon
  ): boolean {
    for (const [key, value] of Object.keys(options)) {
      if (value !== layer.get(key)) return true;
    }
    return false;
  }

  private DrawPolygon(pc: string, polygon: PolygonDataItem) {
    const { options } = polygon;
    options.paths = getPath(polygon.paths);
    // eslint-disable-next-line no-undef
    const newPolygon = new google.maps.Polygon(options);
    this.polygonsOnMap[pc] = newPolygon;

    newPolygon.addListener('dblclick', event => {
      this.removeVertex(event, newPolygon);
    });
    newPolygon.addListener('click', () => {
      this.clickedPolygon(pc, newPolygon);
    });
    newPolygon.addListener('mouseover', event => {
      this.mouseoverPolygon(event.domEvent, pc);
    });
    newPolygon.addListener('mouseout', () => {
      this.mouseoutPolygon();
    });
    newPolygon.setMap(map);
    if (this.editPolygon.pc === pc) {
      this.setPolygonEditMode(this.editPolygon);
    } else {
      this.setPolygonEditMode({ pc, state: false });
    }
  }

  private DrawMarkers(markerData: MarkerData, editMarkers: boolean) {
    for (const [key, item] of Object.entries(markerData)) {
      const marker = this.markersOnMap[key];
      if (marker === undefined) {
        // New marker to draw
        this.DrawMarker(item, key, editMarkers);
      } else {
        // Has the marker position changed?
        const oldPos = marker.getPosition();
        if (
          oldPos &&
          item.position.lat === oldPos.lat &&
          item.position.lng === oldPos.lng
        ) {
          // Remove the old marker and draw a new one
          marker.setMap(null);
          this.DrawMarker(item, key, editMarkers);
        } else {
          // Move marker to new position
          marker.setPosition(item.position);
        }
      }
    }

    // Finally remove any markers that are no longer required
    const keys = Object.keys(markerData);
    // eslint-disable-next-line no-restricted-syntax
    for (const key in this.markersOnMap) {
      if (!keys.includes(key)) {
        this.markersOnMap[key].setMap(null);
        delete this.markersOnMap[key];
      }
    }
  }

  private DrawMarker(item: MarkerDataItem, key: string, editMarkers: boolean) {
    // eslint-disable-next-line no-undef
    const marker = new google.maps.Marker({
      icon: {
        url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
          item.shape
        )}`,
        // eslint-disable-next-line no-undef
        size: new google.maps.Size(32, 32),
        // eslint-disable-next-line no-undef
        scaledSize: new google.maps.Size(32, 32),
        // eslint-disable-next-line no-undef
        anchor: new google.maps.Point(16, 16),
      },
      position: item.position,
      map,
      title: `${key} ${item.title}`,
      draggable: editMarkers,
    });
    this.markersOnMap[key] = marker;

    marker.addListener('click', () => {
      this.clickedMarker(key, marker);
    });
    marker.addListener('dragend', () => {
      this.moveMarker(key, marker);
    });
  }

  clickedMarker(key: string, marker: google.maps.Marker): void {
    const event = new CustomEvent('clickedMarker', {
      detail: { key, marker },
    });
    this.dispatchEvent(event);
  }

  moveMarker(key: string, marker: google.maps.Marker): void {
    const position = marker.getPosition();
    const event = new CustomEvent('moveMarker', {
      detail: { key, pos: { lat: position?.lat(), lng: position?.lng() } },
    });
    this.dispatchEvent(event);
  }

  mouseoverPolygon(event: MouseEvent, text: string): void {
    if (this.popup) {
      this.showPopup = 'show';
      this.popupText = html`<h2>Hello</h2>
        ${text}`;
      this.popup.style.left = `${event.pageX.toString()}px`;
      this.popup.style.top = `${event.pageY.toString()}px`;
    }
  }

  mouseoutPolygon(): void {
    this.showPopup = 'hide';
  }

  // eslint-disable-next-line class-methods-use-this
  removeVertex(
    event: { vertex: number | undefined },
    polygon: google.maps.Polygon
  ): void {
    if (event.vertex !== undefined) {
      const path = polygon.getPath();
      path.removeAt(event.vertex);
    }
  }

  clickedPolygon(pc: string, polygon: google.maps.Polygon): void {
    if (!polygon.getEditable()) {
      const event = new CustomEvent('clickedPolygon', {
        detail: pc,
      });
      this.dispatchEvent(event);
    }
  }
}
