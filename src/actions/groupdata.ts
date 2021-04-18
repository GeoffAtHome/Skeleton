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
export const SORTBOX_DATA_LOADED = 'SORTBOX_DATA_LOADED';
export const ASSIGNED_DATA_LOADED = 'ASSIGNED_DATA_LOADED';
export const ASSIGNED_DATA_UPDATE_GROUP = 'ASSIGNED_DATA_UPDATE_GROUP';
export const ASSIGNED_DATA_GROUP_UPDATED = 'ASSIGNED_DATA_GROUP_UPDATED';
export const ROUND_DATA_UPDATE_ROUND = 'ROUND_DATA_UPDATE_ROUND';
export const ROUND_DATA_ROUND_UPDATED = 'ROUND_DATA_ROUND_UPDATED';
export const ADD_GROUP = 'ADD_GROUP';
export const UPDATE_GROUP = 'UPDATE_GROUP';
export const DELETE_GROUP = 'DELETE_GROUP';
export const SELECT_GROUP = 'SELECT_GROUP';
export const ADD_SORTBOX = 'ADD_SORTBOX';
export const UPDATE_SORTBOX = 'UPDATE_SORTBOX';
export const DELETE_SORTBOX = 'DELETE_SORTBOX';
export const SELECT_SORTBOX = 'SELECT_SORTBOX';
export const SORTBOX_DATA_UPDATE_SORTBOX = 'SORTBOX_DATA_UPDATE_SORTBOX';
export const GROUP_DATA_CHANGES = 'GROUP_DATA_CHANGES';
export const GROUP_DATA_DELETES = 'GROUP_DATA_DELETES';

/* name – identifier for the district
id – numeric number for the district
streets – array of streets the district is responsible for
rounds – array of rounds the district is responsible for
notes – notes about the district
contactDetails – name, phone number, email address….. */

export interface AssignedDataItem {
  _id: string;
  key: string;
  sortbox?: string;
}

export interface AssignedData {
  [index: string]: AssignedDataItem;
}

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

export interface SortboxDataItem {
  _id: string;
  name: string;
  notes: string;
  contactDetails: string;
  colour: string;
}

export interface SortboxData {
  [index: string]: SortboxDataItem;
}

export interface GroupFilter {
  [index: string]: boolean;
}

export interface GroupDataState {
  _newGroup: GroupDataItem;
  _index: string;
  _groupData: GroupData;
  _assignedData: AssignedData;
  _sortboxData: SortboxData;
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
export interface SortboxDataLoaded extends Action<'SORTBOX_DATA_LOADED'> {
  _data: SortboxData;
}
export interface AssignedDataLoaded extends Action<'ASSIGNED_DATA_LOADED'> {
  _data: AssignedData;
}
export interface AssignedDataUpdateGroup
  extends Action<'ASSIGNED_DATA_UPDATE_GROUP'> {
  _id: string;
  _groupKey: string;
}
export interface AssignedDataGroupUpdated
  extends Action<'ASSIGNED_DATA_GROUP_UPDATED'> {
  _id: string;
  _groupKey: string;
}
export interface RoundDataUpdateRound
  extends Action<'ROUND_DATA_UPDATE_ROUND'> {
  _id: string;
  _groupKey: string;
}
export interface RoundDataRoundUpdated
  extends Action<'ROUND_DATA_ROUND_UPDATED'> {
  _id: string;
  _groupKey: string;
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
export interface GroupDataDeleteSortbox extends Action<'DELETE_SORTBOX'> {
  _newSortbox: SortboxDataItem;
}
export interface GroupDataUpdateSortbox extends Action<'UPDATE_SORTBOX'> {
  _newSortbox: SortboxDataItem;
}
export interface GroupDataAddSortbox extends Action<'ADD_SORTBOX'> {
  _newSortbox: SortboxDataItem;
}
export interface GroupDataSelectSortbox extends Action<'SELECT_SORTBOX'> {
  _newSortbox: SortboxDataItem;
}
export interface SortboxDataUpdateSortbox
  extends Action<'SORTBOX_DATA_UPDATE_SORTBOX'> {
  _id: string;
  _sortKey: string;
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
  | GroupDataDeleteSortbox
  | GroupDataUpdateSortbox
  | GroupDataAddSortbox
  | GroupDataSelectSortbox
  | GroupDataChanges
  | GroupDataDeletes
  | GroupDataSelectGroup
  | AssignedDataGroupUpdated
  | AssignedDataLoaded
  | RoundDataUpdateRound
  | RoundDataRoundUpdated
  | AssignedDataUpdateGroup
  | SortboxDataLoaded
  | SortboxDataUpdateSortbox;

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

export const sortboxDataLoaded: ActionCreator<SortboxDataLoaded> = _data => {
  return {
    type: SORTBOX_DATA_LOADED,
    _data,
  };
};

export const assignedDataLoaded: ActionCreator<AssignedDataLoaded> = _data => {
  return {
    type: ASSIGNED_DATA_LOADED,
    _data,
  };
};

export const assignedDataUpdateGroup: ActionCreator<AssignedDataUpdateGroup> = (
  _id: string,
  _groupKey: string
) => {
  return {
    type: ASSIGNED_DATA_UPDATE_GROUP,
    _id,
    _groupKey,
  };
};

export const roundDataUpdateRound: ActionCreator<RoundDataUpdateRound> = (
  _id: string,
  _groupKey: string
) => {
  return {
    type: ROUND_DATA_UPDATE_ROUND,
    _id,
    _groupKey,
  };
};

export const roundDataRoundUpdated: ActionCreator<RoundDataRoundUpdated> = (
  _id,
  _groupKey
) => {
  return {
    type: ROUND_DATA_ROUND_UPDATED,
    _id,
    _groupKey,
  };
};

export const groupDataAddGroup: ActionCreator<GroupDataAddGroup> = _newGroup => {
  return {
    type: ADD_GROUP,
    _newGroup,
  };
};

export const groupDataDeleteGroup: ActionCreator<GroupDataDeleteGroup> = _newGroup => {
  return {
    type: DELETE_GROUP,
    _newGroup,
  };
};

export const groupDataUpdateGroup: ActionCreator<GroupDataUpdateGroup> = _newGroup => {
  return {
    type: UPDATE_GROUP,
    _newGroup,
  };
};

export const groupDataAddSortbox: ActionCreator<GroupDataAddSortbox> = _newSortbox => {
  return {
    type: ADD_SORTBOX,
    _newSortbox,
  };
};

export const groupDataDeleteSortbox: ActionCreator<GroupDataDeleteSortbox> = _newSortbox => {
  return {
    type: DELETE_SORTBOX,
    _newSortbox,
  };
};

export const groupDataUpdateSortbox: ActionCreator<GroupDataUpdateSortbox> = _newSortbox => {
  return {
    type: UPDATE_SORTBOX,
    _newSortbox,
  };
};

export const assignedDataGroupUpdated: ActionCreator<AssignedDataGroupUpdated> = (
  _id,
  _groupKey
) => {
  return {
    type: ASSIGNED_DATA_GROUP_UPDATED,
    _id,
    _groupKey,
  };
};

export const groupDataSelectGroup: ActionCreator<GroupDataSelectGroup> = _newGroup => {
  return {
    type: SELECT_GROUP,
    _newGroup,
  };
};

export const groupDataSelectSortbox: ActionCreator<GroupDataSelectSortbox> = _newSortbox => {
  return {
    type: SELECT_SORTBOX,
    _newSortbox,
  };
};

export const sortboxDataUpdateSortbox: ActionCreator<SortboxDataUpdateSortbox> = (
  _id: string,
  _sortKey: string
) => {
  return {
    type: SORTBOX_DATA_UPDATE_SORTBOX,
    _id,
    _sortKey,
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
