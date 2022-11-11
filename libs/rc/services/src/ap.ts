import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import _                             from 'lodash'

import {
  ApExtraParams,
  AP,
  ApDetails,
  APRadio,
  ApRadioBands,
  CommonUrlsInfo,
  createHttpRequest,
  RequestPayload,
  TableResult,
  ApDetailHeader,
  RadioProperties,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { getShortDurationFormat, getUserDateFormat } from '@acx-ui/utils'

export const baseApApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'apApi',
  tagTypes: ['Ap'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const apApi = baseApApi.injectEndpoints({
  endpoints: (build) => ({
    apList: build.query<TableResult<AP, ApExtraParams>, RequestPayload>({
      query: ({ params, payload }) => {
        const apListReq = createHttpRequest(CommonUrlsInfo.getApsList, params)
        return{
          ...apListReq,
          body: payload
        }
      },
      transformResponse (result: TableResult<AP, ApExtraParams>) {
        return transformApList(result)
      }
    }),
    apDetailHeader: build.query<ApDetailHeader, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getApDetailHeader, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'DETAIL' }]
    }),
    apViewModel: build.query<ApDetailHeader, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getApsList, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse (result: ApDetailHeader) {
        const mockAp = {
          "IP": "string",
          "apGroupId": "string",
          "apGroupName": "string",
          "apMac": "string",
          "apStatusData": {
            "APRadio": [
              {
                "Rssi": 0,
                "band": "string",
                "channel": 0,
                "operativeChannelBandwidth": "string",
                "radioId": 0,
                "txPower": "string"
              }
            ],
            "APSystem": {
              "uptime": 0
            },
            "cellularInfo": {
              "cellular3G4GChannel": 0,
              "cellularActiveSim": "string",
              "cellularBand": "string",
              "cellularCardRemovalCountSIM0": "string",
              "cellularCardRemovalCountSIM1": "string",
              "cellularConnectionStatus": "string",
              "cellularCountry": "string",
              "cellularDHCPTimeoutCountSIM0": "string",
              "cellularDHCPTimeoutCountSIM1": "string",
              "cellularDefaultGateway": "string",
              "cellularDownlinkBandwidth": "string",
              "cellularECIO": 0,
              "cellularICCIDSIM0": "string",
              "cellularICCIDSIM1": "string",
              "cellularIMEI": "string",
              "cellularIMSISIM0": "string",
              "cellularIMSISIM1": "string",
              "cellularIPaddress": "string",
              "cellularIsSIM0Present": "YES",
              "cellularIsSIM1Present": "YES",
              "cellularLTEFirmware": "string",
              "cellularNWLostCountSIM0": "string",
              "cellularNWLostCountSIM1": "string",
              "cellularOperator": "string",
              "cellularRSCP": 0,
              "cellularRSRP": 0,
              "cellularRSRQ": 0,
              "cellularRadioUptime": 0,
              "cellularRoamingStatus": "string",
              "cellularRxBytesSIM0": "string",
              "cellularRxBytesSIM1": "string",
              "cellularSINR": 0,
              "cellularSignalStrength": "string",
              "cellularSubnetMask": "string",
              "cellularSwitchCountSIM0": "string",
              "cellularSwitchCountSIM1": "string",
              "cellularTxBytesSIM0": "string",
              "cellularTxBytesSIM1": "string",
              "cellularUplinkBandwidth": "string",
              "cellularWanInterface": "string"
            }
          },
          "clients": 0,
          "configStatus": "string",
          "connectionStatus": "string",
          "crtTime": "string",
          "description": "string",
          "deviceGroupId": "string",
          "deviceGroupName": "string",
          "deviceModelType": "string",
          "deviceStatus": "string",
          "deviceStatusSeverity": "string",
          "downlink": [
            {
              "IP": "string",
              "apGroupId": "string",
              "apGroupName": "string",
              "apMac": "string",
              "apStatusData": {
                "APRadio": [
                  {
                    "Rssi": 0,
                    "band": "string",
                    "channel": 0,
                    "operativeChannelBandwidth": "string",
                    "radioId": 0,
                    "txPower": "string"
                  }
                ],
                "APSystem": {
                  "uptime": 0
                },
                "cellularInfo": {
                  "cellular3G4GChannel": 0,
                  "cellularActiveSim": "string",
                  "cellularBand": "string",
                  "cellularCardRemovalCountSIM0": "string",
                  "cellularCardRemovalCountSIM1": "string",
                  "cellularConnectionStatus": "string",
                  "cellularCountry": "string",
                  "cellularDHCPTimeoutCountSIM0": "string",
                  "cellularDHCPTimeoutCountSIM1": "string",
                  "cellularDefaultGateway": "string",
                  "cellularDownlinkBandwidth": "string",
                  "cellularECIO": 0,
                  "cellularICCIDSIM0": "string",
                  "cellularICCIDSIM1": "string",
                  "cellularIMEI": "string",
                  "cellularIMSISIM0": "string",
                  "cellularIMSISIM1": "string",
                  "cellularIPaddress": "string",
                  "cellularIsSIM0Present": "YES",
                  "cellularIsSIM1Present": "YES",
                  "cellularLTEFirmware": "string",
                  "cellularNWLostCountSIM0": "string",
                  "cellularNWLostCountSIM1": "string",
                  "cellularOperator": "string",
                  "cellularRSCP": 0,
                  "cellularRSRP": 0,
                  "cellularRSRQ": 0,
                  "cellularRadioUptime": 0,
                  "cellularRoamingStatus": "string",
                  "cellularRxBytesSIM0": "string",
                  "cellularRxBytesSIM1": "string",
                  "cellularSINR": 0,
                  "cellularSignalStrength": "string",
                  "cellularSubnetMask": "string",
                  "cellularSwitchCountSIM0": "string",
                  "cellularSwitchCountSIM1": "string",
                  "cellularTxBytesSIM0": "string",
                  "cellularTxBytesSIM1": "string",
                  "cellularUplinkBandwidth": "string",
                  "cellularWanInterface": "string"
                }
              },
              "clients": 0,
              "configStatus": "string",
              "connectionStatus": "string",
              "crtTime": "string",
              "description": "string",
              "deviceGroupId": "string",
              "deviceGroupName": "string",
              "deviceModelType": "string",
              "deviceStatus": "string",
              "deviceStatusSeverity": "string",
              "downMac": "string",
              "downlink": [
                {}
              ],
              "downlink.downMac": [
                "string"
              ],
              "downlink.rssi": [
                0
              ],
              "downlink.type": [
                0
              ],
              "extIp": "string",
              "externalPort": "string",
              "floorplanId": "string",
              "fwVersion": "string",
              "hops": 0,
              "isMeshEnable": true,
              "lastSeenTime": "string",
              "lastUpdTime": "string",
              "latitude": "string",
              "longitude": "string",
              "meshRole": "string",
              "model": "string",
              "name": "string",
              "rogueCategory": {
                "property1": 0,
                "property2": 0
              },
              "rssi": 0,
              "rxBytes": "string",
              "rxFrames": "string",
              "serialNumber": "string",
              "switchName": "string",
              "switchSerialNumber": "string",
              "tags": "string",
              "txBytes": "string",
              "txFrames": "string",
              "type": 0,
              "uplink": [
                {
                  "IP": "string",
                  "apGroupId": "string",
                  "apGroupName": "string",
                  "apMac": "string",
                  "apStatusData": {
                    "APRadio": [
                      {}
                    ],
                    "APSystem": {
                      "uptime": 0
                    },
                    "cellularInfo": {
                      "cellular3G4GChannel": 0,
                      "cellularActiveSim": "string",
                      "cellularBand": "string",
                      "cellularCardRemovalCountSIM0": "string",
                      "cellularCardRemovalCountSIM1": "string",
                      "cellularConnectionStatus": "string",
                      "cellularCountry": "string",
                      "cellularDHCPTimeoutCountSIM0": "string",
                      "cellularDHCPTimeoutCountSIM1": "string",
                      "cellularDefaultGateway": "string",
                      "cellularDownlinkBandwidth": "string",
                      "cellularECIO": 0,
                      "cellularICCIDSIM0": "string",
                      "cellularICCIDSIM1": "string",
                      "cellularIMEI": "string",
                      "cellularIMSISIM0": "string",
                      "cellularIMSISIM1": "string",
                      "cellularIPaddress": "string",
                      "cellularIsSIM0Present": "YES",
                      "cellularIsSIM1Present": "YES",
                      "cellularLTEFirmware": "string",
                      "cellularNWLostCountSIM0": "string",
                      "cellularNWLostCountSIM1": "string",
                      "cellularOperator": "string",
                      "cellularRSCP": 0,
                      "cellularRSRP": 0,
                      "cellularRSRQ": 0,
                      "cellularRadioUptime": 0,
                      "cellularRoamingStatus": "string",
                      "cellularRxBytesSIM0": "string",
                      "cellularRxBytesSIM1": "string",
                      "cellularSINR": 0,
                      "cellularSignalStrength": "string",
                      "cellularSubnetMask": "string",
                      "cellularSwitchCountSIM0": "string",
                      "cellularSwitchCountSIM1": "string",
                      "cellularTxBytesSIM0": "string",
                      "cellularTxBytesSIM1": "string",
                      "cellularUplinkBandwidth": "string",
                      "cellularWanInterface": "string"
                    }
                  },
                  "clients": 0,
                  "configStatus": "string",
                  "connectionStatus": "string",
                  "crtTime": "string",
                  "description": "string",
                  "deviceGroupId": "string",
                  "deviceGroupName": "string",
                  "deviceModelType": "string",
                  "deviceStatus": "string",
                  "deviceStatusSeverity": "string",
                  "downlink": [
                    {}
                  ],
                  "downlink.downMac": [
                    "string"
                  ],
                  "downlink.rssi": [
                    0
                  ],
                  "downlink.type": [
                    0
                  ],
                  "extIp": "string",
                  "externalPort": "string",
                  "floorplanId": "string",
                  "fwVersion": "string",
                  "hops": 0,
                  "isMeshEnable": true,
                  "lastSeenTime": "string",
                  "lastUpdTime": "string",
                  "latitude": "string",
                  "longitude": "string",
                  "meshRole": "string",
                  "model": "string",
                  "name": "string",
                  "rogueCategory": {
                    "property1": 0,
                    "property2": 0
                  },
                  "rssi": 0,
                  "rxBytes": "string",
                  "rxFrames": "string",
                  "serialNumber": "string",
                  "switchName": "string",
                  "switchSerialNumber": "string",
                  "tags": "string",
                  "txBytes": "string",
                  "txFrames": "string",
                  "type": 0,
                  "upMac": "string",
                  "uplink": [
                    {}
                  ],
                  "uplink.rssi": 0,
                  "uplink.upMac": "string",
                  "venueId": "string",
                  "venueName": "string",
                  "wlanGroup24GId": "string",
                  "wlanGroup5GId": "string",
                  "wlanGroups": [
                    {
                      "radioId": 0,
                      "wlanGroupId": "string",
                      "wlanGroupName": "string"
                    }
                  ],
                  "xPercent": 0,
                  "yPercent": 0
                }
              ],
              "uplink.rssi": 0,
              "uplink.upMac": "string",
              "venueId": "string",
              "venueName": "string",
              "wlanGroup24GId": "string",
              "wlanGroup5GId": "string",
              "wlanGroups": [
                {
                  "radioId": 0,
                  "wlanGroupId": "string",
                  "wlanGroupName": "string"
                }
              ],
              "xPercent": 0,
              "yPercent": 0
            }
          ],
          "downlink.downMac": [
            "string"
          ],
          "downlink.rssi": [
            0
          ],
          "downlink.type": [
            0
          ],
          "extIp": "string",
          "externalPort": "string",
          "floorplanId": "string",
          "fwVersion": "string",
          "hops": 0,
          "isMeshEnable": true,
          "lastSeenTime": "string",
          "lastUpdTime": "string",
          "latitude": "string",
          "longitude": "string",
          "meshRole": "string",
          "model": "string",
          "name": "string",
          "rogueCategory": {
            "property1": 0,
            "property2": 0
          },
          "serialNumber": "string",
          "switchName": "string",
          "switchSerialNumber": "string",
          "tags": "string",
          "uplink": [
            {
              "IP": "string",
              "apGroupId": "string",
              "apGroupName": "string",
              "apMac": "string",
              "apStatusData": {
                "APRadio": [
                  {
                    "Rssi": 0,
                    "band": "string",
                    "channel": 0,
                    "operativeChannelBandwidth": "string",
                    "radioId": 0,
                    "txPower": "string"
                  }
                ],
                "APSystem": {
                  "uptime": 0
                },
                "cellularInfo": {
                  "cellular3G4GChannel": 0,
                  "cellularActiveSim": "string",
                  "cellularBand": "string",
                  "cellularCardRemovalCountSIM0": "string",
                  "cellularCardRemovalCountSIM1": "string",
                  "cellularConnectionStatus": "string",
                  "cellularCountry": "string",
                  "cellularDHCPTimeoutCountSIM0": "string",
                  "cellularDHCPTimeoutCountSIM1": "string",
                  "cellularDefaultGateway": "string",
                  "cellularDownlinkBandwidth": "string",
                  "cellularECIO": 0,
                  "cellularICCIDSIM0": "string",
                  "cellularICCIDSIM1": "string",
                  "cellularIMEI": "string",
                  "cellularIMSISIM0": "string",
                  "cellularIMSISIM1": "string",
                  "cellularIPaddress": "string",
                  "cellularIsSIM0Present": "YES",
                  "cellularIsSIM1Present": "YES",
                  "cellularLTEFirmware": "string",
                  "cellularNWLostCountSIM0": "string",
                  "cellularNWLostCountSIM1": "string",
                  "cellularOperator": "string",
                  "cellularRSCP": 0,
                  "cellularRSRP": 0,
                  "cellularRSRQ": 0,
                  "cellularRadioUptime": 0,
                  "cellularRoamingStatus": "string",
                  "cellularRxBytesSIM0": "string",
                  "cellularRxBytesSIM1": "string",
                  "cellularSINR": 0,
                  "cellularSignalStrength": "string",
                  "cellularSubnetMask": "string",
                  "cellularSwitchCountSIM0": "string",
                  "cellularSwitchCountSIM1": "string",
                  "cellularTxBytesSIM0": "string",
                  "cellularTxBytesSIM1": "string",
                  "cellularUplinkBandwidth": "string",
                  "cellularWanInterface": "string"
                }
              },
              "clients": 0,
              "configStatus": "string",
              "connectionStatus": "string",
              "crtTime": "string",
              "description": "string",
              "deviceGroupId": "string",
              "deviceGroupName": "string",
              "deviceModelType": "string",
              "deviceStatus": "string",
              "deviceStatusSeverity": "string",
              "downlink": [
                {
                  "IP": "string",
                  "apGroupId": "string",
                  "apGroupName": "string",
                  "apMac": "string",
                  "apStatusData": {
                    "APRadio": [
                      {}
                    ],
                    "APSystem": {
                      "uptime": 0
                    },
                    "cellularInfo": {
                      "cellular3G4GChannel": 0,
                      "cellularActiveSim": "string",
                      "cellularBand": "string",
                      "cellularCardRemovalCountSIM0": "string",
                      "cellularCardRemovalCountSIM1": "string",
                      "cellularConnectionStatus": "string",
                      "cellularCountry": "string",
                      "cellularDHCPTimeoutCountSIM0": "string",
                      "cellularDHCPTimeoutCountSIM1": "string",
                      "cellularDefaultGateway": "string",
                      "cellularDownlinkBandwidth": "string",
                      "cellularECIO": 0,
                      "cellularICCIDSIM0": "string",
                      "cellularICCIDSIM1": "string",
                      "cellularIMEI": "string",
                      "cellularIMSISIM0": "string",
                      "cellularIMSISIM1": "string",
                      "cellularIPaddress": "string",
                      "cellularIsSIM0Present": "YES",
                      "cellularIsSIM1Present": "YES",
                      "cellularLTEFirmware": "string",
                      "cellularNWLostCountSIM0": "string",
                      "cellularNWLostCountSIM1": "string",
                      "cellularOperator": "string",
                      "cellularRSCP": 0,
                      "cellularRSRP": 0,
                      "cellularRSRQ": 0,
                      "cellularRadioUptime": 0,
                      "cellularRoamingStatus": "string",
                      "cellularRxBytesSIM0": "string",
                      "cellularRxBytesSIM1": "string",
                      "cellularSINR": 0,
                      "cellularSignalStrength": "string",
                      "cellularSubnetMask": "string",
                      "cellularSwitchCountSIM0": "string",
                      "cellularSwitchCountSIM1": "string",
                      "cellularTxBytesSIM0": "string",
                      "cellularTxBytesSIM1": "string",
                      "cellularUplinkBandwidth": "string",
                      "cellularWanInterface": "string"
                    }
                  },
                  "clients": 0,
                  "configStatus": "string",
                  "connectionStatus": "string",
                  "crtTime": "string",
                  "description": "string",
                  "deviceGroupId": "string",
                  "deviceGroupName": "string",
                  "deviceModelType": "string",
                  "deviceStatus": "string",
                  "deviceStatusSeverity": "string",
                  "downMac": "string",
                  "downlink": [
                    {}
                  ],
                  "downlink.downMac": [
                    "string"
                  ],
                  "downlink.rssi": [
                    0
                  ],
                  "downlink.type": [
                    0
                  ],
                  "extIp": "string",
                  "externalPort": "string",
                  "floorplanId": "string",
                  "fwVersion": "string",
                  "hops": 0,
                  "isMeshEnable": true,
                  "lastSeenTime": "string",
                  "lastUpdTime": "string",
                  "latitude": "string",
                  "longitude": "string",
                  "meshRole": "string",
                  "model": "string",
                  "name": "string",
                  "rogueCategory": {
                    "property1": 0,
                    "property2": 0
                  },
                  "rssi": 0,
                  "rxBytes": "string",
                  "rxFrames": "string",
                  "serialNumber": "string",
                  "switchName": "string",
                  "switchSerialNumber": "string",
                  "tags": "string",
                  "txBytes": "string",
                  "txFrames": "string",
                  "type": 0,
                  "uplink": [
                    {}
                  ],
                  "uplink.rssi": 0,
                  "uplink.upMac": "string",
                  "venueId": "string",
                  "venueName": "string",
                  "wlanGroup24GId": "string",
                  "wlanGroup5GId": "string",
                  "wlanGroups": [
                    {
                      "radioId": 0,
                      "wlanGroupId": "string",
                      "wlanGroupName": "string"
                    }
                  ],
                  "xPercent": 0,
                  "yPercent": 0
                }
              ],
              "downlink.downMac": [
                "string"
              ],
              "downlink.rssi": [
                0
              ],
              "downlink.type": [
                0
              ],
              "extIp": "string",
              "externalPort": "string",
              "floorplanId": "string",
              "fwVersion": "string",
              "hops": 0,
              "isMeshEnable": true,
              "lastSeenTime": "string",
              "lastUpdTime": "string",
              "latitude": "string",
              "longitude": "string",
              "meshRole": "string",
              "model": "string",
              "name": "string",
              "rogueCategory": {
                "property1": 0,
                "property2": 0
              },
              "rssi": 0,
              "rxBytes": "string",
              "rxFrames": "string",
              "serialNumber": "string",
              "switchName": "string",
              "switchSerialNumber": "string",
              "tags": "string",
              "txBytes": "string",
              "txFrames": "string",
              "type": 0,
              "upMac": "string",
              "uplink": [
                {}
              ],
              "uplink.rssi": 0,
              "uplink.upMac": "string",
              "venueId": "string",
              "venueName": "string",
              "wlanGroup24GId": "string",
              "wlanGroup5GId": "string",
              "wlanGroups": [
                {
                  "radioId": 0,
                  "wlanGroupId": "string",
                  "wlanGroupName": "string"
                }
              ],
              "xPercent": 0,
              "yPercent": 0
            }
          ],
          "uplink.rssi": 0,
          "uplink.upMac": "string",
          "venueId": "string",
          "venueName": "string",
          "wlanGroup24GId": "string",
          "wlanGroup5GId": "string",
          "wlanGroups": [
            {
              "radioId": 0,
              "wlanGroupId": "string",
              "wlanGroupName": "string"
            }
          ],
          "xPercent": 0,
          "yPercent": 0
        } as any
        const tmp = transformApDetails(result)
        const ap = {
          ...tmp, 
          apStatusData: mockAp.apStatusData,
          password: 'admin!234'
        }
        return ap
      }
    }),
    apDetails: build.query<ApDetails, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getAp, params)
        return {
          ...req
        }
      }
    })
  })
})

export const {
  useApListQuery,
  useLazyApListQuery,
  useApDetailHeaderQuery,
  useApViewModelQuery,
  useApDetailsQuery
} = apApi


const transformApList = (result: TableResult<AP, ApExtraParams>) => {
  let channelColumnStatus = {
    channel24: true,
    channel50: false,
    channelL50: false,
    channelU50: false,
    channel60: false
  }

  result.data = result.data.map(item => {
    if (item.apStatusData?.APRadio) {
      const apRadioArray = item.apStatusData.APRadio

      const apRadioObject = {
        apRadio24: apRadioArray.find((item: APRadio) =>
          item.band === ApRadioBands.band24),
        apRadio50: apRadioArray.find((item: APRadio) =>
          item.band === ApRadioBands.band50 && item.radioId === 1),
        apRadioL50: apRadioArray.find((item: APRadio) =>
          item.band === ApRadioBands.band50 && item.radioId === 1),
        apRadioU50: apRadioArray.find((item: APRadio) =>
          item.band === ApRadioBands.band50 && item.radioId === 2),
        apRadio60: apRadioArray.find((item: APRadio) =>
          item.radioId === 2)
      }

      const channelValue = {
        channel24: apRadioObject.apRadio24?.channel,
        channel50: !apRadioObject.apRadioU50 && apRadioObject.apRadio50?.channel,
        channelL50: apRadioObject.apRadioU50 && apRadioObject.apRadioL50?.channel,
        channelU50: apRadioObject.apRadioU50?.channel,
        channel60: !apRadioObject.apRadioU50 && apRadioObject.apRadio60?.channel
      }

      channelColumnStatus = {
        channel24: true,
        channel50: Boolean(channelValue.channel50) || channelColumnStatus.channel50,
        channelL50: Boolean(channelValue.channelL50) || channelColumnStatus.channelL50,
        channelU50: Boolean(channelValue.channelU50) || channelColumnStatus.channelU50,
        channel60: Boolean(channelValue.channel60) || channelColumnStatus.channel60
      }
      return { ...item, ...channelValue }
    } else {
      return item
    }
  })
  result.extra = channelColumnStatus

  return result

}

const transformApDetails = (result: any) => {
  const ap = result?.data[0]
  ap.lastSeenTime = ap.lastSeenTime ? getUserDateFormat(ap.lastSeenTime, undefined, true) : '--'
  // get uptime field.
  if (ap.apStatusData && ap.apStatusData.APSystem && ap.apStatusData.APSystem.uptime) {
    ap.uptime = getShortDurationFormat(ap.apStatusData.APSystem.uptime * 1000)
  } else {
    ap.uptime = '--'
  }

  // set Radio Properties fields.
  if (ap.apStatusData && ap.apStatusData.APRadio) {
    const apRadio24 = _.find(ap.apStatusData.APRadio,
      r => r.band === ApRadioBands.band24)
    const apRadioU50 = _.find(ap.apStatusData.APRadio,
      r => r.band === ApRadioBands.band50 && r.radioId === 2)
    const apRadio50 = !apRadioU50 &&_.find(ap.apStatusData.APRadio,
      r => r.band === ApRadioBands.band50 && r.radioId === 1)
    const apRadio60 = !apRadioU50 && _.find(ap.apStatusData.APRadio,
      r => r.radioId === 2)
    const apRadioL50 = apRadioU50 && _.find(ap.apStatusData.APRadio,
      r => r.band === ApRadioBands.band50 && r.radioId === 1)

    ap.channel24 = apRadio24 as RadioProperties
    ap.channel50 = apRadio50 as RadioProperties
    ap.channelL50 = apRadioL50 as RadioProperties
    ap.channelU50 = apRadioU50 as RadioProperties
    ap.channel60 = apRadio60 as RadioProperties
  } else {
    ap.channel24 = {
      Rssi: '--',
      channel: '--',
      txPower: '--'
    } as RadioProperties
    ap.channel50 = {
      Rssi: '--',
      channel: '--',
      txPower: '--'
    } as RadioProperties
  }
  return ap
}