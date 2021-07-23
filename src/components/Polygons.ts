import { TemplateResult } from 'lit-html';

type pair = number[];
export interface LatLng {
  lat: number;
  lng: number;
}

type PolygonPath = Array<pair>;
type SinglePolygon = Array<PolygonPath>;
type MultiplePolygon = Array<Array<PolygonPath>>;
export type MapPolygon = {
  coordinates: SinglePolygon | MultiplePolygon;
  type: string;
};

export interface EditMapDataItem {
  paths: MapPolygon;
  options: google.maps.PolygonOptions;
  text: TemplateResult;
}

export interface EditMapData {
  [index: string]: EditMapDataItem;
}

export interface PolygonsOnMap {
  [index: string]: google.maps.Polygon;
}

export function getPathP(polygon: PolygonPath): Array<LatLng> {
  return polygon.map(point => {
    return { lat: point[1], lng: point[0] };
  });
}
export function getPath(polygon: MapPolygon): Array<LatLng> {
  const polygonPath: PolygonPath = <PolygonPath>polygon.coordinates[0];
  return getPathP(polygonPath);
}

export function getPaths(polygon: MapPolygon): Array<Array<LatLng>> {
  const result = [];
  const { length } = polygon.coordinates;
  let loop = 0;
  while (loop < length) {
    console.log(polygon.coordinates[loop].length);
    const polygonPath: PolygonPath =
      polygon.coordinates[loop].length === 1
        ? <PolygonPath>polygon.coordinates[loop][0]
        : <PolygonPath>polygon.coordinates[loop];
    result.push(getPathP(polygonPath));
    loop += 1;
  }
  return result;
}

export function pathsAreDifferent(
  oldPath: MapPolygon,
  newPath: MapPolygon
): boolean {
  if (oldPath.type !== newPath.type) return true;
  if (oldPath.coordinates.length !== newPath.coordinates.length) return true;
  if (
    JSON.stringify(oldPath.coordinates) !== JSON.stringify(newPath.coordinates)
  )
    return true;

  return false;
}

export function getPathGooglePolygon(polygon: google.maps.Polygon): MapPolygon {
  const paths = polygon.getPaths().getArray();
  if (paths.length === 1) {
    const path = paths[0].getArray();
    return {
      type: 'Polygon',
      coordinates: [path.map(p => [p.lng(), p.lat()])],
    };
  }
  const { length } = paths;
  const coordinates = [];
  let loop = 0;
  while (loop < length) {
    const path = paths[loop].getArray();
    coordinates.push(path.map(p => [p.lng(), p.lat()]));
    loop += 1;
  }

  const p: MapPolygon = {
    type: 'MultiPolygon',
    coordinates,
  };
  return p;
}
