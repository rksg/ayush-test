/* eslint-disable max-len */
import { cloneDeep, find } from 'lodash'

import {
  APExtended,
  APGeneralFixtures,
  APGroupFixtures,
  ApExtraParams,
  Capabilities,
  NewAPExtendedGrouped,
  NewAPModelExtended,
  TableResult,
  Venue
} from '@acx-ui/rc/utils'

import {
  aggregateApGroupInfo,
  aggregatePoePortInfo,
  aggregateVenueInfo,
  transformApListFromNewModel, transformGroupByListFromNewModel,
  transformApFromNewType,
  getNewApViewmodelPayloadFromOld,
  findTargetLanPorts
} from './apUtils'

const { mockAPList, mockAPModels, mockGroupedApList, mockedApLanPortSettings_T750SE } = APGeneralFixtures
const { mockRbacAPGroupList } = APGroupFixtures

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

  it('test transformGroupByListFromNewModel', async () => {
    const cloneData = cloneDeep(mockGroupedApList) as unknown as TableResult<NewAPExtendedGrouped, ApExtraParams>
    const result = transformGroupByListFromNewModel(cloneData, mockRbacAPGroupList)
    const dataList = result.data
    expect(dataList[2].members).toBe(2)
    expect(dataList[2].incidents).toBe(0)
    expect(dataList[2].clients).toBe(2)
    expect(dataList[2].networks?.count).toBe(0)
    expect(dataList[2].apGroupName).toBe('joe-apg-01')
    expect(dataList[2].apGroupId).toBe('58195e050b8a4770acc320f6233ad8d9')
    expect(dataList[2].deviceGroupName).toBe('joe-apg-01')
    expect(dataList[2].deviceGroupId).toBe('58195e050b8a4770acc320f6233ad8d9')
    expect(dataList[2].venueId).toBe('a919812d11124e6c91b56b9d71eacc31')
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
    aggregateApGroupInfo(cloneData, mockRbacAPGroupList)
    expect(cloneData.data[0].apGroupName).toBe('joe-apg-02')
    expect(cloneData.data[1].apGroupName).toBe('joe-apg-01')
  })

  it('test aggregateVenueInfo with grouped list', async () => {
    const cloneData = cloneDeep(mockGroupedApList) as unknown as TableResult<NewAPExtendedGrouped, ApExtraParams>
    aggregateVenueInfo(cloneData, mockVenueList as unknown as TableResult<Venue>)
    expect(cloneData.data[2].aps[0].venueName).toBe('My-Venue')
    expect(cloneData.data[2].aps[1].venueName).toBe('My-Venue')
  })

  it('test aggregatePoePortInfo with grouped list', async () => {
    const cloneData = cloneDeep(mockGroupedApList) as unknown as TableResult<NewAPExtendedGrouped, ApExtraParams>
    aggregatePoePortInfo(cloneData, mockAPModels as unknown as Capabilities)
    expect(cloneData.data[2].aps[0].poePort).toBe('1')
    expect(cloneData.data[2].aps[1].poePort).toBe('2')
  })

  it('test aggregateApGroupInfo with grouped list', async () => {
    const cloneData = cloneDeep(mockGroupedApList) as unknown as TableResult<NewAPExtendedGrouped, ApExtraParams>
    aggregateApGroupInfo(cloneData, mockRbacAPGroupList)
    expect(cloneData.data[2].aps[0].apGroupName).toBe('joe-apg-01')
    expect(cloneData.data[2].aps[0].apGroupName).toBe('joe-apg-01')
  })

  describe('getNewApViewmodelPayloadFromOld', () => {
    it('get apStatusData all fields', async () => {
      const result = getNewApViewmodelPayloadFromOld({
        fields: ['apStatusData']
      })

      expect(result.fields).toContain('networkStatus')
      expect(result.fields).toContain('lanPortStatuses')
      expect(result.fields).toContain('radioStatuses')
      expect(result.fields).toContain('afcStatus')
    })

    it('get apStatusData partial fields', async () => {
      const result = getNewApViewmodelPayloadFromOld({
        fields: ['apStatusData.APSystem']
      })

      expect(result.fields).toContain('networkStatus')
      expect(result.fields).not.toContain('afcStatus')
    })

    it('get apStatusData deep fields', async () => {
      const result = getNewApViewmodelPayloadFromOld({
        fields: ['apStatusData.APSystem.ipType']
      })

      expect(result.fields).toContain('networkStatus.ipAddressType')
      expect(result.fields).not.toContain('networkStatus')
      expect(result.fields).not.toContain('afcStatus')
    })

    it('get apStatusData special fields', async () => {
      const result = getNewApViewmodelPayloadFromOld({
        fields: [
          'IP',
          'apStatusData.APSystem.uptime',
          'apStatusData.APSystem.secureBootEnabled',
          'apStatusData.APSystem.managementVlan'
        ]
      })

      expect(result.fields).toContain('networkStatus.ipAddress')
      expect(result.fields).toContain('uptime')
      expect(result.fields).toContain('supportSecureBoot')
      expect(result.fields).toContain('networkStatus.managementTrafficVlan')
      expect(result.fields).not.toContain('networkStatus.uptime')
      expect(result.fields).not.toContain('networkStatus')
      expect(result.fields).not.toContain('afcStatus')
    })
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
        const data = find(result.apStatusData?.lanPortStatus, { port: lanPort.id })
        expect(data?.phyLink).toBe(lanPort.physicalLink)
      })

      // AP radio
      target.radioStatuses?.forEach(radio => {
        const data = find(result.apStatusData?.APRadio, { radioId: radio.id })
        expect(data?.txPower).toBe(radio.transmitterPower)
        expect(data?.channel).toBe(radio.channel)
        expect(data?.band).toBe(radio.band)
        expect(data?.Rssi).toBe(radio.rssi)
        expect(data?.operativeChannelBandwidth).toBe(radio.channelBandwidth)
      })

      // AP system
      expect(result.apStatusData?.APSystem?.uptime).toBe(target.uptime)
      expect(result.apStatusData?.APSystem?.ipType).toBe(target.networkStatus?.ipAddressType)
      expect(result.apStatusData?.APSystem?.netmask).toBe(target.networkStatus?.netmask)
      expect(result.apStatusData?.APSystem?.gateway).toBe(target.networkStatus?.gateway)
      expect(result.apStatusData?.APSystem?.primaryDnsServer).toBe(target.networkStatus?.primaryDnsServer)
      expect(result.apStatusData?.APSystem?.secondaryDnsServer).toBe(target.networkStatus?.secondaryDnsServer)
      expect(result.apStatusData?.APSystem?.secureBootEnabled).toBe(target.supportSecureBoot)
      expect(result.apStatusData?.APSystem?.managementVlan).toBe(target?.networkStatus?.managementTrafficVlan)

      // cellular status
      const cellularStatus = target.cellularStatus
      expect(result.apStatusData?.cellularInfo?.cellularActiveSim).toBe(cellularStatus?.activeSim)
      expect(result.apStatusData?.cellularInfo?.cellularBand).toBe(cellularStatus?.rfBand)
      expect(result.apStatusData?.cellularInfo?.cellularCountry).toBe(undefined)
      expect(result.apStatusData?.cellularInfo?.cellularOperator).toBe(undefined)
      expect(result.apStatusData?.cellularInfo?.cellular3G4GChannel).toBe(cellularStatus?.connectionChannel)
      expect(result.apStatusData?.cellularInfo?.cellularConnectionStatus).toBe(cellularStatus?.connectionStatus)
      expect(result.apStatusData?.cellularInfo?.cellularECIO).toBe(cellularStatus?.ecio)
      expect(result.apStatusData?.cellularInfo?.cellularDownlinkBandwidth).toBe(cellularStatus?.downlinkBandwidth)

      expect(result.apStatusData?.cellularInfo?.cellularIsSIM0Present).toBe('YES')
      expect(result.apStatusData?.cellularInfo?.cellularICCIDSIM0).toBe(cellularStatus?.primarySimStatus.iccid)
      expect(result.apStatusData?.cellularInfo?.cellularRxBytesSIM0).toBe(cellularStatus?.primarySimStatus.rxBytes + '')

      expect(result.apStatusData?.cellularInfo?.cellularIsSIM1Present).toBe('NO')
      expect(result.apStatusData?.cellularInfo?.cellularICCIDSIM1).toBe(undefined)
      expect(result.apStatusData?.cellularInfo?.cellularRxBytesSIM1).toBe(undefined)

    })
  })

  describe('findTargetLanPorts', () => {
    const mockApSerialNumber = 'mocked_serialNumber'
    const mockedActivations = [
      {
        venueId: 'mocked_venueId',
        apSerialNumber: 'mocked_serialNumber',
        portId: 1
      },{
        venueId: 'mocked_venueId',
        apSerialNumber: 'mocked_serialNumber',
        portId: 3
      }]
    it('test findTargetLanPorts', async () => {
      const result = findTargetLanPorts(mockedApLanPortSettings_T750SE, mockedActivations, mockApSerialNumber)
      expect(result.length).toBe(2)
      expect(result[0].portId).toBe('1')
      expect(result[1].portId).toBe('3')
    })
  })
})