
type pair = number[]
export interface LatLng {
    lat: number,
    lng: number
}
export interface Polygon {
    coordinates: Array<Array<pair>>;
    type: string;
}

export interface PolygonDataItem {
    polygon: Polygon;
    options: google.maps.PolygonOptions;
}

export interface PolygonData {
    [index: string]: PolygonDataItem;
}

export interface PolygonsOnMap {
    [index: string]: google.maps.Polygon;
}

export function getPath(polygon: Polygon): Array<LatLng> {
    return polygon.coordinates[0].map(pair => { return { lat: pair[1], lng: pair[0] } })
}

export function pathsAreDifferent(oldPath: Polygon, newPath: Polygon): boolean {
    if (oldPath.type !== newPath.type) return true
    if (oldPath.coordinates.length !== newPath.coordinates.length) return true
    if (JSON.stringify(oldPath.coordinates) !== JSON.stringify(newPath.coordinates)) return true

    return false
}

export function getPathGooglePolygon(polygon: google.maps.Polygon): Polygon {
    const paths = polygon.getPaths().getArray()
    if (paths.length === 1) {
        const path = paths[0].getArray()
        return {
            type: 'Polygon',
            coordinates: [path.map((p) => [p.lng(), p.lat()])]
        }
    } else {
        console.log('Path has more than one polygon')
    }

    const p: Polygon = {
        type: 'Polygon',
        coordinates: []
    }
    return p
}
