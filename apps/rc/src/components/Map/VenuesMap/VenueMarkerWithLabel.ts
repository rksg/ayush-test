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
    labelStyle?: {
      [prop: string]: string
    };
    labelClass?: string;
    tooltipVisible?: boolean;
    deployedDpCount?: number;
  }

class VenueMarkerWithLabel extends MarkerWithLabel {
  venueData: VenueMarkerOptions

  constructor (options: MarkerWithLabelOptions, venueData: VenueMarkerOptions) {
    super(options)
    this.venueData = venueData
  }
}

export default VenueMarkerWithLabel
