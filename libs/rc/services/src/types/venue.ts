export interface VenueDetailHeader {
	activeLteNetworkCount: number,
	activeNetworkCount: number,
	aps: {
		summary: {},
		totalApCount: 0,
		detail: {}
	},
	lteAps: {
		summary: {},
		totalApCount: 0,
		detail: {}
	},
	switchClients: {
		totalCount: 0
	},
	switches: {
		summary: {},
		totalCount: 0
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