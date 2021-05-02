/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { Reducer } from 'redux';
import {
  PUBLICSTREET_ID,
  PublicStreetState,
  PUBLICSTREET_SELECTED_VIEW,
  AllowedViews,
} from '../actions/publicstreet';
import { RootAction, RootState } from '../store';

const INITIAL_STATE: PublicStreetState = {
  streetName: '',
  index: '',
  selectedView: AllowedViews.Both,
};

const publicStreetMap: Reducer<PublicStreetState, RootAction> = (
  state = INITIAL_STATE,
  action
) => {
  switch (action.type) {
    case PUBLICSTREET_ID:
      return {
        ...state,
        _index: action._index,
        streetName: action._name,
      };

    case PUBLICSTREET_SELECTED_VIEW:
      return {
        ...state,
        selectedView: action._selectedView,
      };
    default:
      return state;
  }
};

export default publicStreetMap;

// Per Redux best practices, the shop data in our store is structured
// for efficiency (small size and fast updates).
//
// The _selectors_ below transform store data into specific forms that
// are tailored for presentation. Putting this logic here keeps the
// layers of our app loosely coupled and easier to maintain, since
// views don't need to know about the store's internal data structures.
//
// We use a tiny library called `reselect` to create efficient
// selectors. More info: https://github.com/reduxjs/reselect.

export const publicStreetMapSelector = (state: RootState) =>
  state.publicStreetMap;