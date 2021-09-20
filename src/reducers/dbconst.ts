export const rootURL = 'https://scoutpostadmin.soord.org.uk:6984/';
// export const rootURL = "http://192.168.15.199:5984/";
// ADMIN            | USER
// assignedDataURL  | sortDataURL and sortBoxesURL
// groupDataURL     | groupsURL
// When changing URL don't forget to update certificates on web server and couchdb
// export const rootURL = 'https://postadmin.soord.org.uk:6984/';
export const assignedDataURL = 'assigned'; // Each Postcode is assigned to a group
export const groupDataURL = 'groupdata'; // List of groups
export const labelsURL = 'labels';
export const polygonURL = 'polygons';
export const postboxURL = 'postbox';
export const streetInfoURL = 'streetinfo';
export const roundsURL = 'groupdb_'; // List of rounds per group
export const groupsURL = 'rounddb_'; // Each Postcode is assigned to a round
export const sortBoxesURL = 'sortboxdb_'; // Sort boxes per group
export const sortDataURL = 'sortdatadb_'; // Each Postcode is assigned to a sortbox
export const changeOptions = { since: 'now', live: true, include_docs: true };
export const remoteDBOptions: PouchDB.Configuration.RemoteDatabaseConfiguration =
  {
    skip_setup: true,
  };
