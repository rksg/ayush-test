import { ApVenueStatusEnum, ChartData } from '..'

export interface VenueMarkerOptions extends google.maps.MarkerOptions {
  name?: string;
  status?: ApVenueStatusEnum;
  apsCount: number;
  venueId: string;
  latitude?: number;
  longitude?: number;
  apStat: ChartData[],
  switchStat: ChartData[],
  clientsCount?: number;
  switchesCount: number;
  switchClientsCount?: number;
  edgeStat: ChartData[];
  edgesCount: number;
}
