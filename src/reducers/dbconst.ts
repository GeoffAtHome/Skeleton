// export const rootURL = 'https://scoutpostadmin.soord.org.uk:6984/';
// export const rootURL = "http://192.168.15.199:5984/";
export const rootURL = 'https://scoutpostadmin.soord.org.uk:6984/';
export const assignedDataURL = 'assigned';
export const groupDataURL = 'groupdata';
export const labelsURL = 'labels';
export const polygonURL = 'polygons';
export const postboxURL = 'postbox';
export const streetInfoURL = 'streetinfo';
export const changeOptions = { since: 'now', live: true, include_docs: true };
export const remoteDBOptions: PouchDB.Configuration.RemoteDatabaseConfiguration = {
  skip_setup: true,
};
