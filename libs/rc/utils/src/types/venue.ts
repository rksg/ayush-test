import { ApStatusDetails } from './ap'

import { ApVenueStatusEnum, SwitchStatusEnum } from './index'

export interface VenueDetailHeader {
	activeLteNetworkCount: number,
	activeNetworkCount: number,
	aps: {
		summary: {
			[key in ApVenueStatusEnum]?: number
    },
		totalApCount: number,
		detail: {
			[key in ApVenueStatusEnum]?: ApStatusDetails[]
    }
	},
	lteAps: {
		summary: {
      [key in ApVenueStatusEnum]?: number
    },
		totalApCount: number,
		detail: {
      [key in ApVenueStatusEnum]?: ApStatusDetails[]
    }
	},
	switchClients: {
		totalCount: number
	},
	switches: {
		summary: {
			[key in SwitchStatusEnum]?: number
		},
		totalCount: number
	},
	totalClientCount: string
	venue: VenueDetail
}

export interface VenueDetail {
		addressLine: string,
		city: string,
		country: string,
		crtTime: string,
		id: string,
		lastUpdTime: string,
		latitude: string,
		longitude: string,
		name: string,
		tenantId: string,
		timeZone: string,
		type: string,
		venueStatus: string
}

export interface FloorPlanDto {
	id: string;
// validation need to take care
//   @IsNotEmpty({message: 'This field is required'})
//   @MinLength(2, {message: 'This field should be at least 2 characters'})
//   @MaxLength(32, {message: 'Name is too long. Maximal length is 32 characters'})
  	name: string;
// Validation need to take care
//   @Min(-32768, {message: 'Value should be at least -32768'})
//   @Max(32767, {message: 'Value should not exceed 32767'})
//   @IsNotEmpty({message: 'This field is required'})
  floorNumber: number,
  image: FloorPlanImage,
  imageId?: string,
  imageUrl?: string,
  imageBlob?: string, //used for SVG
  imageName?: string
}

export interface FloorPlanImage {
	id: string,
	name: string
}