/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { Action, ActionCreator } from 'redux';

export const PUBLICSTREET_ID = 'PUBLICSTREET_ID';
export const PUBLIC_STREET_DATA_LOADED = 'PUBLIC_STREET_DATA_LOADED';
export const PUBLICSTREET_SELECTED_VIEW = 'PUBLICSTREET_SELECTED_VIEW';

export interface PublicStreet {
  name: string;
  wName?: string;
}

export interface PublicStreetItem {
  name: string;
}

export interface PublicStreetData {
  [pc: string]: PublicStreet;
}

export enum AllowedViews {
  English,
  Welsh,
  Both,
}

export interface PublicStreetState {
  _loadingStatus: string;
  streetName: string;
  index: string;
  selectedView: AllowedViews;
}

export interface PublicStreetPublicStreetID extends Action<'PUBLICSTREET_ID'> {
  _index: string;
  _name: string;
}
export interface PublicStreetSelectedView
  extends Action<'PUBLICSTREET_SELECTED_VIEW'> {
  _selectedView: AllowedViews;
}

export type PublicStreetAction =
  | PublicStreetPublicStreetID
  | PublicStreetSelectedView;

export const publicStreetState: ActionCreator<PublicStreetPublicStreetID> = (
  _index,
  _name
) => {
  return {
    type: PUBLICSTREET_ID,
    _index,
    _name,
  };
};

export const publicStreetSelectedView: ActionCreator<PublicStreetSelectedView> = _selectedView => {
  return {
    type: PUBLICSTREET_SELECTED_VIEW,
    _selectedView,
  };
};

export function getNames(view: AllowedViews, item: PublicStreet) {
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
