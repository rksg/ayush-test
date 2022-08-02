export interface VenueDetailHeader {
	activeLteNetworkCount: number,
	activeNetworkCount: number,
	aps: {
		summary: any,
		totalApCount: number,
		detail: any
	},
	lteAps: {
		summary: any,
		totalApCount: number,
		detail: any
	},
	switchClients: {
		totalCount: number
	},
	switches: {
		summary: any,
		totalCount: number
	},
	totalClientCount: string
	venue: {
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
}