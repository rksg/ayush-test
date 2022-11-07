import { MarkerWithLabel, MarkerWithLabelOptions } from '@googlemaps/markerwithlabel'

import { ApVenueStatusEnum, ChartData } from '@acx-ui/rc/utils'

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
  }

class VenueMarkerWithLabel extends MarkerWithLabel {
  venueMarker: VenueMarkerOptions

  constructor (options: MarkerWithLabelOptions, venueMarker: VenueMarkerOptions) {
    super(options)
    this.venueMarker = venueMarker
  }
}

export default VenueMarkerWithLabel
