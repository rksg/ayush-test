/* eslint-disable max-len */
import _ from 'lodash'

import { cssStr }    from '@acx-ui/components'
import {
  ChartData,
  Dashboard,
  ApVenueStatusEnum,
  SwitchStatusEnum } from '@acx-ui/rc/utils'

import * as UI                from './styledComponents'
import { VenueMarkerOptions } from './VenueMarkerWithLabel'

export const getAPStatusDisplayName = (label: ApVenueStatusEnum,
  severity: boolean = true) => {
  switch (label) {
    case ApVenueStatusEnum.REQUIRES_ATTENTION:
      return `${severity ? '1 ' : ''}Requires Attention`
    case ApVenueStatusEnum.TRANSIENT_ISSUE:
      return `${severity ? '2 ' : ''}Transient Issue`
    case ApVenueStatusEnum.IN_SETUP_PHASE:
      return `${severity ? '3 ' : ''}In Setup Phase`
    case ApVenueStatusEnum.OPERATIONAL:
      return `${severity ? '4 ' : ''}Operational`
    case ApVenueStatusEnum.OFFLINE:
    default:
      return `${severity ? '3 ' : ''}Offline`
  }
}

export const getSwitchStatusDisplayName = (switchStatus: SwitchStatusEnum) => {
  switch (switchStatus) {
    case SwitchStatusEnum.OPERATIONAL:
      return 'Operational'
    case SwitchStatusEnum.DISCONNECTED:
      return 'Requires Attention'
    case SwitchStatusEnum.NEVER_CONTACTED_CLOUD:
    case SwitchStatusEnum.INITIALIZING:
    case SwitchStatusEnum.APPLYING_FIRMWARE:
    default:
      return 'In Setup Phase'
  }
}

export const getVenueInfoMarkerIcon = (status: string) => {
  switch (status) {
    case ApVenueStatusEnum.OPERATIONAL:
      return UI.VenueInfoMarkerGreenIcon
    case ApVenueStatusEnum.TRANSIENT_ISSUE:
      return UI.VenueInfoMarkerOrangeIcon
    case ApVenueStatusEnum.REQUIRES_ATTENTION:
      return UI.VenueInfoMarkerRedIcon
    case ApVenueStatusEnum.IN_SETUP_PHASE:
    case ApVenueStatusEnum.OFFLINE:
    default:
      return UI.VenueInfoMarkerGreyIcon
  }
}

export const getVenueSeverityByStatus = (status: string) => {
  switch (status) {
    case ApVenueStatusEnum.REQUIRES_ATTENTION:
      return 1
    case ApVenueStatusEnum.TRANSIENT_ISSUE:
      return 2
    case ApVenueStatusEnum.IN_SETUP_PHASE:
    case ApVenueStatusEnum.OFFLINE:
      return 3
    case ApVenueStatusEnum.OPERATIONAL:
    default:
      return 4
  }
}

export const massageVenuesData = (overviewData?: Dashboard): VenueMarkerOptions[] => {
  const venues: VenueMarkerOptions[] = []
  overviewData?.venues?.forEach((venue) => {
    _.forIn(venue, (val, venueId) => {
      // Adding mock coordinates (Piazza San Pietro, Rome) if position is missing
      if (!val.latitude || !val.longitude) {
        val.latitude = 41.9021622
        val.longitude = 12.4572277
        // eslint-disable-next-line no-console
        console.error(`Venue '${val.name}' doesn't include location. Using default coordinates.`)
      }

      const { apStat, apsCount } = getApStatusDataByVenue(overviewData, venueId)
      const { switchStat, switchesCount } = getSwitchStatusDataByVenue(overviewData, venueId)

      venues.push({
        venueId,
        name: val.name,
        status: val.venueStatus,
        latitude: val.latitude,
        longitude: val.longitude,
        clientsCount: overviewData?.summary?.clients?.summary[venueId],
        switchClientsCount: getSwitchClientCountByVenue(overviewData, venueId),
        apStat,
        switchStat,
        apsCount,
        switchesCount,
        visible: true
      })
    })
  })
  return venues
}

function getSwitchClientCountByVenue (overviewData: Dashboard, venueId: string): number {
  return _.get(overviewData, 'summary.switchClients.summary[' + venueId + ']') || 0
}

const getApStatusDataByVenue = (
  overviewData: Dashboard,
  venueId: string): {
  apStat: ChartData[],
  apsCount: number
  } => {
  const apsStatus = overviewData?.aps?.apsStatus.find((el: object) => {
    for (const key in el) {
      if (key === venueId) {
        return true
      }
    }
    return false
  })

  let requires_attention: number = 0
  let in_setup_phase: number = 0
  let transient_issue: number = 0
  let operational: number = 0

  if (apsStatus && apsStatus[venueId] && apsStatus[venueId].apStatus) {
    if (apsStatus[venueId].apStatus[ApVenueStatusEnum.REQUIRES_ATTENTION]) {
      requires_attention = +apsStatus[venueId].apStatus[ApVenueStatusEnum.REQUIRES_ATTENTION]!
    }
    if (apsStatus[venueId].apStatus[ApVenueStatusEnum.TRANSIENT_ISSUE]) {
      transient_issue = +apsStatus[venueId].apStatus[ApVenueStatusEnum.TRANSIENT_ISSUE]!
    }
    if (apsStatus[venueId].apStatus[ApVenueStatusEnum.IN_SETUP_PHASE]) {
      in_setup_phase = +apsStatus[venueId].apStatus[ApVenueStatusEnum.IN_SETUP_PHASE]!
    }
    if (apsStatus[venueId].apStatus[ApVenueStatusEnum.OFFLINE]) {
      in_setup_phase += +apsStatus[venueId].apStatus[ApVenueStatusEnum.OFFLINE]!
    }
    if (apsStatus[venueId].apStatus[ApVenueStatusEnum.OPERATIONAL]) {
      operational = +apsStatus[venueId].apStatus[ApVenueStatusEnum.OPERATIONAL]!
    }
  }

  return {
    apStat: [{
      category: 'APs',
      series: [
        { name: getAPStatusDisplayName(ApVenueStatusEnum.REQUIRES_ATTENTION),
          value: requires_attention },
        { name: getAPStatusDisplayName(ApVenueStatusEnum.TRANSIENT_ISSUE),
          value: transient_issue },
        { name: getAPStatusDisplayName(ApVenueStatusEnum.IN_SETUP_PHASE),
          value: in_setup_phase },
        { name: getAPStatusDisplayName(ApVenueStatusEnum.OPERATIONAL),
          value: operational }
      ]
    }],
    apsCount: apsStatus && apsStatus[venueId] ? apsStatus[venueId].totalCount : 0
  }
}

function getSwitchStatusDataByVenue (overviewData: Dashboard, venueId: string): {
  switchStat: ChartData[],
  switchesCount: number
} {
  const switchStat = (_.get(overviewData, 'switches.switchesStatus') || []).find((el: [string]) => {
    for (const key in el) {
      if (key === venueId) {
        return true
      }
    }
    return false
  })

  let operational: number = 0
  let requires_attention: number = 0
  let in_setup_phase: number = 0

  if (switchStat && switchStat[venueId] && switchStat[venueId].switchStatus) {
    if (switchStat[venueId].switchStatus[SwitchStatusEnum.DISCONNECTED]) {
      requires_attention = +switchStat[venueId].switchStatus[SwitchStatusEnum.DISCONNECTED]
    }
    if (switchStat[venueId].switchStatus[SwitchStatusEnum.NEVER_CONTACTED_CLOUD]) {
      in_setup_phase = +switchStat[venueId].switchStatus[SwitchStatusEnum.NEVER_CONTACTED_CLOUD]
    }
    if (switchStat[venueId].switchStatus[SwitchStatusEnum.INITIALIZING]) {
      in_setup_phase += +switchStat[venueId].switchStatus[SwitchStatusEnum.INITIALIZING]
    }
    if (switchStat[venueId].switchStatus[SwitchStatusEnum.OPERATIONAL]) {
      operational = +switchStat[venueId].switchStatus[SwitchStatusEnum.OPERATIONAL]
    }
  }

  return {
    switchStat: [{
      category: 'Switches',
      series: [
        { name: getAPStatusDisplayName(ApVenueStatusEnum.REQUIRES_ATTENTION),
          value: requires_attention },
        { name: getAPStatusDisplayName(ApVenueStatusEnum.TRANSIENT_ISSUE),
          value: 0 },
        { name: getAPStatusDisplayName(ApVenueStatusEnum.IN_SETUP_PHASE),
          value: in_setup_phase },
        { name: getAPStatusDisplayName(ApVenueStatusEnum.OPERATIONAL),
          value: operational }
      ]
    }],
    switchesCount: switchStat && switchStat[venueId] ? switchStat[venueId].totalCount : 0
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getMarkerColor = (statuses: any[] | undefined) => {
  // ApVenueStatusEnum.OPERATIONAL
  let color: { default: string, hover: string } = {
    default: cssStr('--acx-semantics-green-50'),
    hover: cssStr('--acx-semantics-green-70')

  } // default case

  if (statuses?.includes(ApVenueStatusEnum.REQUIRES_ATTENTION))
    color = {
      default: cssStr('--acx-semantics-red-50'),
      hover: cssStr('--acx-semantics-red-70')
    }
  else if (statuses?.includes(ApVenueStatusEnum.TRANSIENT_ISSUE))
    color = {
      default: cssStr('--acx-semantics-yellow-40'),
      hover: cssStr('--acx-semantics-yellow-70')
    }
  else if (statuses?.includes(ApVenueStatusEnum.IN_SETUP_PHASE) ||
    statuses?.includes(ApVenueStatusEnum.OFFLINE))
    color = {
      default: cssStr('--acx-neutrals-50'),
      hover: cssStr('--acx-neutrals-70')
    }
  return color
}

const svgUrlPrefix = 'data:image/svg+xml;base64,'
export const getIcon = (svg: string, scaledSize: google.maps.Size) => ({
  icon: {
    url: `${svgUrlPrefix}${window.btoa(svg)}`,
    scaledSize
  }
})

export const getClusterSVG = (fillColor: string) => (
  `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d_2866_241195)">
      <circle cx="19" cy="19" r="15" fill="${fillColor}"/>
      <circle cx="19" cy="19" r="14" stroke="white" stroke-width="2"/>
    </g>
    <defs>
      <filter id="filter0_d_2866_241195" x="0" y="0" width="38" height="38" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2866_241195"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2866_241195" result="shape"/>
      </filter>
    </defs>
  </svg>
  `)

export const getMarkerSVG = (fillColor: string) => (
  `<svg width="47" height="68" viewBox="0 0 47 68" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d_632_15254)">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M36.2791 8.31035C39.9358 11.8506 41.7641 16.1775 41.7641 21.2912C41.7641 25.2248 40.0593 30.6335 36.6497 37.5173C33.2401 44.4011 30.5224 49.3426 28.4964 52.342C26.4704 55.3414 24.7656 57.7753 23.382 59.6438L18.7865 53.0058C15.7228 48.5805 12.6592 43.1719 9.59551 36.7797C6.53182 30.3876 5 25.2248 5 21.2912C5 16.1775 6.8036 11.8506 10.4108 8.31035C14.0181 4.7701 18.3418 3 23.382 3C28.4223 3 32.7213 4.7701 36.2791 8.31035ZM28.5708 26.7492C29.9544 25.3725 30.6462 23.6515 30.6462 21.5864C30.6462 19.5212 29.9544 17.8003 28.5708 16.4235C27.1872 15.0468 25.4577 14.3584 23.3823 14.3584C21.3069 14.3584 19.5774 15.0468 18.1938 16.4235C16.8102 17.8003 16.1184 19.5212 16.1184 21.5864C16.1184 23.6515 16.8102 25.3725 18.1938 26.7492C19.5774 28.126 21.3069 28.8144 23.3823 28.8144C25.4577 28.8144 27.1872 28.126 28.5708 26.7492Z" fill="${fillColor}"/>
      <path d="M36.2791 8.31035L35.5737 9.01927L35.5835 9.0288L36.2791 8.31035ZM23.382 59.6438L22.5598 60.213L23.3547 61.3611L24.1857 60.2389L23.382 59.6438ZM18.7865 53.0058L17.9643 53.575L18.7865 53.0058ZM35.5835 9.0288C39.0446 12.3797 40.7641 16.4469 40.7641 21.2912H42.7641C42.7641 15.9081 40.827 11.3215 36.9747 7.5919L35.5835 9.0288ZM40.7641 21.2912C40.7641 24.9843 39.148 30.2203 35.7536 37.0734L37.5458 37.9611C40.9706 31.0467 42.7641 25.4653 42.7641 21.2912H40.7641ZM35.7536 37.0734C32.347 43.9513 29.6538 48.8419 27.6677 51.7823L29.3251 52.9018C31.3909 49.8434 34.1333 44.8509 37.5458 37.9611L35.7536 37.0734ZM27.6677 51.7823C25.6459 54.7755 23.9501 57.1963 22.5784 59.0486L24.1857 60.2389C25.5812 58.3543 27.2949 55.9073 29.3251 52.9018L27.6677 51.7823ZM24.2042 59.0745L19.6087 52.4366L17.9643 53.575L22.5598 60.213L24.2042 59.0745ZM19.6087 52.4366C16.5828 48.0659 13.5448 42.706 10.4973 36.3475L8.69374 37.2119C11.7736 43.6378 14.8628 49.0951 17.9643 53.575L19.6087 52.4366ZM10.4973 36.3475C7.45441 29.9988 6 24.9992 6 21.2912H4C4 25.4505 5.60923 30.7764 8.69374 37.2119L10.4973 36.3475ZM6 21.2912C6 16.4424 7.69817 12.3738 11.1113 9.02406L9.71039 7.59665C5.90902 11.3274 4 15.9126 4 21.2912H6ZM11.1113 9.02406C14.5321 5.66673 18.6046 4 23.382 4V2C18.079 2 13.504 3.87347 9.71039 7.59665L11.1113 9.02406ZM23.382 4C28.1592 4 32.2042 5.6663 35.5738 9.01921L36.9845 7.6015C33.2384 3.8739 28.6854 2 23.382 2V4ZM29.2761 27.4581C30.8601 25.8819 31.6462 23.9004 31.6462 21.5864H29.6462C29.6462 23.4026 29.0486 24.863 27.8654 26.0404L29.2761 27.4581ZM31.6462 21.5864C31.6462 19.2723 30.8601 17.2909 29.2761 15.7147L27.8654 17.1324C29.0486 18.3097 29.6462 19.7701 29.6462 21.5864H31.6462ZM29.2761 15.7147C27.6924 14.1388 25.7035 13.3584 23.3823 13.3584V15.3584C25.2119 15.3584 26.6819 15.9548 27.8654 17.1324L29.2761 15.7147ZM23.3823 13.3584C21.0611 13.3584 19.0722 14.1388 17.4885 15.7147L18.8992 17.1324C20.0826 15.9548 21.5527 15.3584 23.3823 15.3584V13.3584ZM17.4885 15.7147C15.9044 17.2909 15.1184 19.2723 15.1184 21.5864H17.1184C17.1184 19.7701 17.716 18.3097 18.8992 17.1324L17.4885 15.7147ZM15.1184 21.5864C15.1184 23.9004 15.9044 25.8819 17.4885 27.4581L18.8992 26.0404C17.716 24.863 17.1184 23.4026 17.1184 21.5864H15.1184ZM17.4885 27.4581C19.0722 29.034 21.0611 29.8144 23.3823 29.8144V27.8144C21.5527 27.8144 20.0826 27.218 18.8992 26.0404L17.4885 27.4581ZM23.3823 29.8144C25.7035 29.8144 27.6924 29.034 29.2761 27.4581L27.8654 26.0404C26.6819 27.218 25.2119 27.8144 23.3823 27.8144V29.8144Z" fill="white"/>
    </g>
    <defs>
      <filter id="filter0_d_632_15254" x="0" y="0" width="46.7642" height="67.3611" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="2"/>
        <feGaussianBlur stdDeviation="2"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_632_15254"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_632_15254" result="shape"/>
      </filter>
    </defs>
  </svg>
`)
