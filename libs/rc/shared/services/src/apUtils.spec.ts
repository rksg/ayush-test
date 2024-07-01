/* eslint-disable max-len */
import { cloneDeep, find } from 'lodash'

import {
  APGeneralFixtures,
  APGroupFixtures,
  ApExtraParams,
  ApGroup,
  Capabilities,
  NewAPModelExtended,
  TableResult,
  Venue
} from '@acx-ui/rc/utils'

import {
  aggregateApGroupInfo,
  aggregatePoePortInfo,
  aggregateVenueInfo,
  transformApListFromNewModel,
  transformApFromNewType
} from './apUtils'

const { mockAPList, mockAPModels } = APGeneralFixtures
const { mockAPGroupList } = APGroupFixtures

const mockAPListWithExtraInfo = {
  ...mockAPList,
  data: [
    {
      ...mockAPList.data[0],
      poePort: '1'
    },
    {
      ...mockAPList.data[1],
      poePort: '2'
    }
  ]
}
const mockVenueList = {
  fields: [
    'name',
    'id'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '0e2f68ab79154ffea64aa52c5cc48826',
      name: 'My-Venue'
    },
    {
      id: '991eb992ece042a183b6945a2398ddb9',
      name: 'joe-test'
    }
  ]
}

describe('Test apUtils', () => {
  it('test transformApListFromNewModel', async () => {
    const cloneData = cloneDeep(mockAPListWithExtraInfo) as unknown as TableResult<NewAPModelExtended, ApExtraParams>
    const result = transformApListFromNewModel(cloneData)
    const dataList = result.data
    expect(dataList[0].channel24).toBe(8)
    expect(dataList[0].channel50).toBe(64)
    expect(dataList[0].channel60).toBe(undefined)
    expect(dataList[0].channelL50).toBe(undefined)
    expect(dataList[0].channelU50).toBe(undefined)
    expect(dataList[0].hasPoeStatus).toBeTruthy()
    expect(dataList[0].isPoEStatusUp).toBeTruthy()
    expect(dataList[0].poePortInfo).toBe('1000Mbps')
    expect(dataList[1].channel24).toBe(3)
    expect(dataList[1].channel50).toBe(128)
    expect(dataList[1].channel60).toBe(undefined)
    expect(dataList[1].channelL50).toBe(undefined)
    expect(dataList[1].channelU50).toBe(undefined)
    expect(dataList[1].hasPoeStatus).toBeTruthy()
    expect(dataList[1].isPoEStatusUp).toBeTruthy()
    expect(dataList[1].poePortInfo).toBe('100Mbps')
    expect(result.extra?.channel24).toBeTruthy()
    expect(result.extra?.channel50).toBeTruthy()
    expect(result.extra?.channel60).toBeFalsy()
    expect(result.extra?.channelL50).toBeFalsy()
    expect(result.extra?.channelU50).toBeFalsy()
  })

  it('test aggregateVenueInfo', async () => {
    const cloneData = cloneDeep(mockAPList) as unknown as TableResult<NewAPModelExtended, ApExtraParams>
    aggregateVenueInfo(cloneData, mockVenueList as unknown as TableResult<Venue>)
    expect(cloneData.data[0].venueName).toBe('My-Venue')
    expect(cloneData.data[1].venueName).toBe('joe-test')
  })

  it('test aggregatePoePortInfo', async () => {
    const cloneData = cloneDeep(mockAPList) as unknown as TableResult<NewAPModelExtended, ApExtraParams>
    aggregatePoePortInfo(cloneData, mockAPModels as unknown as Capabilities)
    expect(cloneData.data[0].poePort).toBe('1')
    expect(cloneData.data[1].poePort).toBe('2')
  })

  it('test aggregateApGroupInfo', async () => {
    const cloneData = cloneDeep(mockAPList) as unknown as TableResult<NewAPModelExtended, ApExtraParams>
    aggregateApGroupInfo(cloneData, mockAPGroupList as unknown as TableResult<ApGroup>)
    expect(cloneData.data[0].apGroupName).toBe('joe-apg-02')
    expect(cloneData.data[1].apGroupName).toBe('joe-apg-01')
  })

  describe('transformApFromNewType', () => {
    it('test transformApFromNewType', async () => {
      const cloneData = cloneDeep(mockAPList) as unknown as TableResult<NewAPModelExtended, ApExtraParams>
      const target = cloneData.data[0]
      const result = transformApFromNewType(target) as APExtended
      expect(result.fwVersion).toBe(target.firmwareVersion)
      expect(result.apMac).toBe(target.macAddress)
      expect(result.deviceStatus).toBe(target.status)
      expect(result.deviceGroupId).toBe(target.apGroupId)
      expect(result.IP).toBe(target.networkStatus?.ipAddress)

      // LAN port
      target.lanPortStatuses?.forEach(lanPort => {
        const data = find(result.apStatusData.lanPortStatus, { port: lanPort.id })
        expect(data.phyLink).toBe(lanPort.physicalLink)
      })

      // AP radio
      target.radioStatuses?.forEach(radio => {
        const data = find(result.apStatusData.APRadio, { radioId: radio.id })
        expect(data.txPower).toBe(radio.transmitterPower)
        expect(data.channel).toBe(radio.channel)
        expect(data.band).toBe(radio.band)
        expect(data.Rssi).toBe(radio.rssi)
        expect(data.operativeChannelBandwidth).toBe(radio.channelBandwidth)
      })

      // AP system
      expect(result.APSystem.uptime).toBe(target.uptime)
      expect(result.APSystem.ipType).toBe(target.networkStatus.ipAddressType)
      expect(result.APSystem.netmask).toBe(target.networkStatus.netmask)
      expect(result.APSystem.gateway).toBe(target.networkStatus?.gateway)
      expect(result.APSystem.primaryDnsServer).toBe(target.networkStatus?.primaryDnsServer)
      expect(result.APSystem.secondaryDnsServer).toBe(target.networkStatus?.secondaryDnsServer)
      expect(result.APSystem.secureBootEnabled).toBe(target.supportSecureBoot)
      expect(result.APSystem.managementVlan).toBe(target.managementTrafficVlan)
    })
  })
})