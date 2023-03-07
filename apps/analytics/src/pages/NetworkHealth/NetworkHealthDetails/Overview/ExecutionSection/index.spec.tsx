import { render, screen } from '@acx-ui/test-utils'

import { fetchServiceGuardTest } from '../../../__tests__/fixtures'
import { NetworkHealthTest }     from '../../../types'

import { ConfigStatusEnum, ExecutionSection, getExecutionSectionData } from '.'

jest.mock('./Score', () => ({ Score: () => <div data-testid='Score' /> }))
jest.mock('./Status', () => ({ Status: () => <div data-testid='Status' /> }))

describe('ExecutionSection', () => {
  it('should render correctly', () => {
    render(<ExecutionSection
      details={fetchServiceGuardTest.serviceGuardTest as unknown as NetworkHealthTest}/>)
    expect(screen.queryByTestId('Score')).toBeVisible()
    expect(screen.queryByTestId('Status')).toBeVisible()
    expect(screen.queryByText('Chart')).toBeVisible()
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
    } as unknown as NetworkHealthTest)).toStrictEqual({
      details: {
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
        errorAps: 0,
        chart: undefined
      } })
  })
  it('should handle empty data', () => {
    expect(getExecutionSectionData(null as unknown as NetworkHealthTest))
      .toStrictEqual({ details: {
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
        errorAps: undefined,
        chart: undefined
      } })
  })
  it('should return correct data with ping and speed not configured', () => {
    expect(getExecutionSectionData({
      ...fetchServiceGuardTest.serviceGuardTest,
      ...data,
      config: { pingAddress: null, speedTestEnabled: false }
    } as unknown as NetworkHealthTest).details.configured).toStrictEqual({
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
    } as unknown as NetworkHealthTest).details.configured).toStrictEqual({
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
