import { cssStr }                     from '@acx-ui/components'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import { fetchServiceGuardTest } from '../../../__tests__/fixtures'
import { stages }                from '../../../contents'
import { ServiceGuardTest }      from '../../../types'

import {
  ConfigStatusEnum,
  ExecutionSection,
  getExecutionSectionData,
  getChatData
} from '.'

jest.mock('./Score', () => ({ Score: () => <div data-testid='Score' /> }))
jest.mock('./Status', () => ({ Status: () => <div data-testid='Status' /> }))

describe('ExecutionSection', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<ExecutionSection
      details={fetchServiceGuardTest.serviceGuardTest as unknown as ServiceGuardTest}/>)
    expect(screen.queryByTestId('Score')).toBeVisible()
    expect(screen.queryByTestId('Status')).toBeVisible()
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should handle no data correctly', async () => {
    render(<ExecutionSection
      details={{
        ...fetchServiceGuardTest.serviceGuardTest, summary: { apsTestedCount: 0 }
      } as unknown as ServiceGuardTest}/>)
    expect(await screen.findByText('No data to display')).toBeValid()
  })
})

describe('getExecutionSectionData', () => {
  const data = {
    config: {
      pingAddress: 'google.com',
      speedTestEnabled: true
    },
    summary: {
      apsFailureCount: 1,
      apsErrorCount: 0,
      apsSuccessCount: 4,
      apsTestedCount: 5,
      avgPingTime: 44.779,
      avgUpload: 16.05,
      avgDownload: 19.01
    },
    previousTest: {
      summary: {
        apsSuccessCount: 3,
        apsTestedCount: 5,
        avgPingTime: 88,
        avgUpload: 19,
        avgDownload: 16
      }
    }
  }
  it('should return correct data', () => {
    expect(getExecutionSectionData({
      ...fetchServiceGuardTest.serviceGuardTest,
      ...data
    } as unknown as ServiceGuardTest)).toStrictEqual({
      configured: {
        passedApsPercent: ConfigStatusEnum.Configured,
        avgPingTime: ConfigStatusEnum.Configured,
        avgUpload: ConfigStatusEnum.Configured,
        avgDownload: ConfigStatusEnum.Configured,
        testedAps: ConfigStatusEnum.Configured,
        successAps: ConfigStatusEnum.Configured,
        failureAps: ConfigStatusEnum.Configured,
        errorAps: ConfigStatusEnum.Configured
      },
      passedApsPercent: [0.6, 0.8],
      avgPingTime: [88, 44.779],
      avgUpload: [19, 16.05],
      avgDownload: [16, 19.01],
      testedAps: 5,
      successAps: 4,
      failureAps: 1,
      errorAps: 0
    })
  })
  it('should handle empty data', () => {
    expect(getExecutionSectionData(null as unknown as ServiceGuardTest))
      .toStrictEqual({
        configured: {
          passedApsPercent: ConfigStatusEnum.Configured,
          avgPingTime: ConfigStatusEnum.NA,
          avgUpload: ConfigStatusEnum.NA,
          avgDownload: ConfigStatusEnum.NA,
          testedAps: ConfigStatusEnum.Configured,
          successAps: ConfigStatusEnum.Configured,
          failureAps: ConfigStatusEnum.Configured,
          errorAps: ConfigStatusEnum.Configured
        },
        passedApsPercent: [NaN, NaN],
        avgPingTime: [undefined, undefined],
        avgUpload: [undefined, undefined],
        avgDownload: [undefined, undefined],
        testedAps: undefined,
        successAps: undefined,
        failureAps: undefined,
        errorAps: undefined
      })
  })
  it('should return correct data with ping and speed not configured', () => {
    expect(getExecutionSectionData({
      ...fetchServiceGuardTest.serviceGuardTest,
      ...data,
      config: { pingAddress: null, speedTestEnabled: false }
    } as unknown as ServiceGuardTest).configured).toStrictEqual({
      passedApsPercent: ConfigStatusEnum.Configured,
      avgPingTime: ConfigStatusEnum.NA,
      avgUpload: ConfigStatusEnum.NA,
      avgDownload: ConfigStatusEnum.NA,
      testedAps: ConfigStatusEnum.Configured,
      successAps: ConfigStatusEnum.Configured,
      failureAps: ConfigStatusEnum.Configured,
      errorAps: ConfigStatusEnum.Configured
    })
  })
  it('should return "no-data" for configured if test is empty', () => {
    expect(getExecutionSectionData({
      ...fetchServiceGuardTest.serviceGuardTest,
      summary: { apsTestedCount: 0 }
    } as unknown as ServiceGuardTest).configured).toStrictEqual({
      passedApsPercent: ConfigStatusEnum.NoData,
      avgPingTime: ConfigStatusEnum.NoData,
      avgUpload: ConfigStatusEnum.NoData,
      avgDownload: ConfigStatusEnum.NoData,
      testedAps: ConfigStatusEnum.NoData,
      successAps: ConfigStatusEnum.NoData,
      failureAps: ConfigStatusEnum.NoData,
      errorAps: ConfigStatusEnum.NoData
    })
  })
})

describe('getChatData', () => {
  it('should return correct data',() => {
    const { result } = renderHook(() =>
      getChatData(fetchServiceGuardTest.serviceGuardTest as unknown as ServiceGuardTest))
    expect(result.current).toEqual({
      categories: [
        '802.11 Auth', 'Association', 'PSK', 'DHCP', 'DNS', 'Ping', 'Traceroute', 'Speed Test'],
      data: [
        { name: 'Pass',
          data: [ 2, 2, 2, 2, 2, 2, 2, 2],
          color: cssStr('--acx-semantics-green-50') },
        { name: 'Fail',
          data: [ 0, 0, 0, 0, 0, 0, 0, 0],
          color: cssStr('--acx-semantics-red-50') },
        { name: 'Error',
          data: [ 0, 0, 0, 0, 0, 0, 0, 0],
          color: cssStr('--acx-semantics-yellow-40') },
        { name: 'N/A',
          data: [ 0, 0, 0, 0, 0, 0, 0, 0],
          color: cssStr('--acx-neutrals-50') }
      ]
    })
  })
  it('should handing pending',() => {
    const test = {
      ...fetchServiceGuardTest.serviceGuardTest,
      summary: {
        apsErrorCount: 0,
        apsFailureCount: 0,
        apsPendingCount: 0,
        apsSuccessCount: 0,
        apsTestedCount: 0,
        ...Object.keys(stages).reduce((acc, stage) => ({
          ...acc,
          [`${stage}Error`]: 0,
          [`${stage}Failure`]: 0,
          [`${stage}NA`]: 0,
          [`${stage}Pending`]: 1,
          [`${stage}Success`]: 2
        }),{})
      }
    }
    const { result } = renderHook(() => getChatData(test as unknown as ServiceGuardTest))
    expect(result.current).toEqual({
      categories: [
        '802.11 Auth', 'Association', 'PSK', 'DHCP', 'DNS', 'Ping', 'Traceroute', 'Speed Test'],
      data: [
        { name: 'Pass',
          data: [ 2, 2, 2, 2, 2, 2, 2, 2],
          color: cssStr('--acx-semantics-green-50') },
        { name: 'Fail',
          data: [ 0, 0, 0, 0, 0, 0, 0, 0],
          color: cssStr('--acx-semantics-red-50') },
        { name: 'Error',
          data: [ 0, 0, 0, 0, 0, 0, 0, 0],
          color: cssStr('--acx-semantics-yellow-40') },
        { name: 'N/A',
          data: [ 0, 0, 0, 0, 0, 0, 0, 0],
          color: cssStr('--acx-neutrals-50') },
        { name: 'Pending',
          data: [ 1, 1, 1, 1, 1, 1, 1, 1],
          color: cssStr('--acx-primary-white') }
      ]
    })
  })
})
