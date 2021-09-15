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

export const GROUP_ID = 'GROUP_ID';
export const GROUP_DATA_LOAD = 'GROUP_DATA_LOAD';
export const GROUP_DATA_LOADED = 'GROUP_DATA_LOADED';
export const ADD_GROUP = 'ADD_GROUP';
export const UPDATE_GROUP = 'UPDATE_GROUP';
export const DELETE_GROUP = 'DELETE_GROUP';
export const SELECT_GROUP = 'SELECT_GROUP';
export const GROUP_DATA_CHANGES = 'GROUP_DATA_CHANGES';
export const GROUP_DATA_DELETES = 'GROUP_DATA_DELETES';

export interface StreetData {
  [index: string]: Array<string>;
}

export interface GroupDataItem {
  _id: string;
  name: string;
  notes: string;
  contactDetails: string;
  colour: string;
}

export interface GroupData {
  [index: string]: GroupDataItem;
}

export interface GroupFilter {
  [index: string]: boolean;
}

export interface GroupDataState {
  _newGroup: GroupDataItem;
  _index: string;
  _groupData: GroupData;
}

export interface GroupDataId extends Action<'GROUP_ID'> {
  _newGroup: GroupDataItem;
  _index: string;
}

export interface GroupDataLoad extends Action<'GROUP_DATA_LOAD'> {
  _admin: boolean;
  _groupId: string;
}
export interface GroupDataLoaded extends Action<'GROUP_DATA_LOADED'> {
  _data: GroupData;
}
export interface GroupDataAddGroup extends Action<'ADD_GROUP'> {
  _newGroup: GroupDataItem;
}
export interface GroupDataDeleteGroup extends Action<'DELETE_GROUP'> {
  _newGroup: GroupDataItem;
}
export interface GroupDataUpdateGroup extends Action<'UPDATE_GROUP'> {
  _newGroup: GroupDataItem;
}
export interface GroupDataSelectGroup extends Action<'SELECT_GROUP'> {
  _newGroup: GroupDataItem;
}
export interface GroupDataChanges extends Action<'GROUP_DATA_CHANGES'> {
  _docs: GroupData;
}
export interface GroupDataDeletes extends Action<'GROUP_DATA_DELETES'> {
  _docs: GroupData;
}

export type GroupDataAction =
  | GroupDataId
  | GroupDataLoad
  | GroupDataLoaded
  | GroupDataAddGroup
  | GroupDataDeleteGroup
  | GroupDataUpdateGroup
  | GroupDataChanges
  | GroupDataDeletes
  | GroupDataSelectGroup;

export const groupDataState: ActionCreator<GroupDataId> = (
  _newGroup,
  _index
) => {
  return {
    type: GROUP_ID,
    _newGroup,
    _index,
  };
};

export const groupDataLoad: ActionCreator<GroupDataLoad> = (
  _admin,
  _groupId
) => {
  return {
    type: GROUP_DATA_LOAD,
    _admin,
    _groupId,
  };
};

export const groupDataLoaded: ActionCreator<GroupDataLoaded> = _data => {
  return {
    type: GROUP_DATA_LOADED,
    _data,
  };
};

export const groupDataAddGroup: ActionCreator<GroupDataAddGroup> =
  _newGroup => {
    return {
      type: ADD_GROUP,
      _newGroup,
    };
  };

export const groupDataDeleteGroup: ActionCreator<GroupDataDeleteGroup> =
  _newGroup => {
    return {
      type: DELETE_GROUP,
      _newGroup,
    };
  };

export const groupDataUpdateGroup: ActionCreator<GroupDataUpdateGroup> =
  _newGroup => {
    return {
      type: UPDATE_GROUP,
      _newGroup,
    };
  };

export const groupDataSelectGroup: ActionCreator<GroupDataSelectGroup> =
  _newGroup => {
    return {
      type: SELECT_GROUP,
      _newGroup,
    };
  };

export const groupDataChanges: ActionCreator<GroupDataChanges> = _docs => {
  return {
    type: GROUP_DATA_CHANGES,
    _docs,
  };
};

export const groupDataDeletes: ActionCreator<GroupDataDeletes> = _docs => {
  return {
    type: GROUP_DATA_DELETES,
    _docs,
  };
};
