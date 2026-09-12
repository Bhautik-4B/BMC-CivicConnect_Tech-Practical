export interface IZone {
  id: string;
  name: string;
  code: string;
}

export interface IWard {
  id: string;
  zoneId: string;
  zoneName?: string;
  wardNumber: number;
  name: string;
  boundaryPolygon?: {
    type: 'Polygon';
    coordinates: number[][][]; // [ [ [lng, lat], ... ] ]
  };
  officeAddress?: string;
  nodalOfficerName?: string;
}
