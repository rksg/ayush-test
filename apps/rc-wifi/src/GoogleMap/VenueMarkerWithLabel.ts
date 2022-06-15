import { MarkerWithLabel, MarkerWithLabelOptions } from '@googlemaps/markerwithlabel'

export interface VenueMarkerOptions extends google.maps.MarkerOptions {
    name?: string;
    status?: string;
    apsCount?: number;
    venueId?: string;
    apStat?: {
        [prop: string]: number
    };
    clientsCount?: number;
    switchesCount?: number;
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
