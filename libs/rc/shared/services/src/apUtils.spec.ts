/* eslint-disable max-len */
import { cloneDeep } from 'lodash'

import {
  APGeneralFixtures,
  APGroupFixtures,
  ApExtraParams,
  Capabilities,
  NewAPExtendedGrouped,
  NewAPModelExtended,
  TableResult,
  Venue
} from '@acx-ui/rc/utils'

import { aggregateApGroupInfo, aggregatePoePortInfo, aggregateVenueInfo, transformApListFromNewModel, transformGroupByListFromNewModel } from './apUtils'

const { mockAPList, mockAPModels, mockGroupedApList } = APGeneralFixtures
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
})