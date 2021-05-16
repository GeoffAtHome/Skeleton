type pair = number[];
export interface LatLng {
  lat: number;
  lng: number;
}
export interface MapPolygon {
  coordinates: Array<Array<pair>>;
  type: string;
}

export interface EditMapDataItem {
  paths: MapPolygon;
  options: google.maps.PolygonOptions;
}

export interface EditMapData {
  [index: string]: EditMapDataItem;
}

export interface PolygonsOnMap {
  [index: string]: google.maps.Polygon;
}

export function getPath(polygon: MapPolygon): Array<LatLng> {
  return polygon.coordinates[0].map(pair => {
    return { lat: pair[1], lng: pair[0] };
  });
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
  console.log('Path has more than one polygon');

  const p: MapPolygon = {
    type: 'Polygon',
    coordinates: [],
  };
  return p;
}
