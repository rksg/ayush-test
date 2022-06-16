import * as _ from 'lodash'

import { ApVenueStatusEnum, DashboardOverview } from './constant'
import { VenueMarkerOptions }                   from './VenueMarkerWithLabel'

export const massageVenuesData = (overviewData: DashboardOverview): VenueMarkerOptions[] => {
  const venues: VenueMarkerOptions[] = []
  overviewData?.venues?.forEach((venue) => {
    _.forIn(venue, (val, venueId) => {
      // todo: if venue has no coordinates, adding mock coordinates (Piazza San Pietro, Rome) and throwing relevant error
      if (!val.latitude || !val.longitude) {
        val.latitude = 41.9021622
        val.longitude = 12.4572277
        // eslint-disable-next-line no-console
        console.error(`Venue '${val.name}' doesn't include location,
          dummy coordinates were added for gmap correct behaviour`)
      }
      const apStat = overviewData?.aps?.apsStatus.find((el) => {
        for (const key in el) {
          if (key === venueId) {
            return true
          }
        }
        return false
      })

      let requires_attention: number | undefined = 0
      let in_setup_phase: number | undefined = 0
      let transient_issue: number | undefined = 0
      let operational :number | undefined = 0

      if (apStat && apStat[venueId] && apStat[venueId].apStatus) {

        if (apStat[venueId].apStatus[ApVenueStatusEnum.REQUIRES_ATTENTION]) {
          requires_attention = apStat[venueId].apStatus[ApVenueStatusEnum.REQUIRES_ATTENTION]
        }

        if (apStat[venueId].apStatus[ApVenueStatusEnum.IN_SETUP_PHASE]) {
          in_setup_phase = apStat[venueId].apStatus[ApVenueStatusEnum.IN_SETUP_PHASE]
        }

        if (apStat[venueId].apStatus[ApVenueStatusEnum.TRANSIENT_ISSUE]) {
          transient_issue = apStat[venueId].apStatus[ApVenueStatusEnum.TRANSIENT_ISSUE]
        }
        if (apStat[venueId].apStatus[ApVenueStatusEnum.OPERATIONAL]) {
          operational = apStat[venueId].apStatus[ApVenueStatusEnum.OPERATIONAL]
        }
      }
  
      venues.push({
        name: val.name,
        status: val.venueStatus,
        latitude: val.latitude,
        longitude: val.longitude,
        venueId: venueId,
        clientsCount: overviewData?.summary?.clients?.summary[venueId],
        apStat: {
          [ApVenueStatusEnum.REQUIRES_ATTENTION]: requires_attention!,
          [ApVenueStatusEnum.TRANSIENT_ISSUE]: transient_issue!,
          [ApVenueStatusEnum.IN_SETUP_PHASE]: in_setup_phase!,
          [ApVenueStatusEnum.OPERATIONAL]: operational!
        },
        apsCount: apStat && apStat[venueId] ? apStat[venueId].totalCount : 0,
        switchesCount: getSwitchCountByVenue(overviewData, venueId),
        switchClientsCount: getSwitchClientCountByVenue(overviewData, venueId)
      })
    })
  })
  return venues
}

function getSwitchClientCountByVenue (overviewData: DashboardOverview, venueId: string): number {
  return _.get(overviewData, 'summary.switchClients.summary[' + venueId + ']') || 0
}
function getSwitchCountByVenue (overviewData: DashboardOverview, venueId: string): number {
  const switchStat = (_.get(overviewData, 'switches.switchesStatus') || []).find((el: [string]) => {
    for (const key in el) {
      if (key === venueId) {
        return true
      }
    }
    return false
  })
  return switchStat ? switchStat[venueId].totalCount : 0
}
