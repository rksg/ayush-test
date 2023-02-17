import { networkHealthApiURL }                       from '@acx-ui/analytics/services'
import { Provider }                                  from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitFor } from '@acx-ui/test-utils'

import { fetchServiceGuardTest } from '../../__tests__/fixtures'
import { useNetworkHealthTest }  from '../../services'
import { NetworkHealthTest }     from '../../types'

import { Title, SubTitle, statsFromSummary } from '.'

describe('Title', () => {
  it('should render', async () => {
    mockGraphqlQuery(
      networkHealthApiURL, 'FetchServiceGuardTest', { data: fetchServiceGuardTest })
    const TestCompent = () => {
      const queryResults = useNetworkHealthTest()
      return <Title queryResults={queryResults} />
    }
    render(<TestCompent/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    await waitFor(() =>
      expect(screen.queryByText('name')).toBeVisible())
  })
  it('should handle when no data', async () => {
    mockGraphqlQuery(
      networkHealthApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest: null } })
    const TestCompent = () => {
      const queryResults = useNetworkHealthTest()
      return <Title queryResults={queryResults} />
    }
    render(<TestCompent/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    await waitFor(() =>
      expect(screen.queryByText('Test')).toBeVisible())
  })
})

describe('statsFromSummary', () => {
  it('should return correct data', () => {
    expect(statsFromSummary({} as NetworkHealthTest['summary'])).toEqual({
      apsFinishedTest: undefined,
      apsUnderTest: undefined,
      isOngoing: false,
      lastResult: undefined
    })
    expect(statsFromSummary({
      apsTestedCount: 2,
      apsPendingCount: 2,
      apsSuccessCount: 0
    } as unknown as NetworkHealthTest['summary'])).toEqual({
      apsFinishedTest: 0,
      apsUnderTest: 2,
      isOngoing: true,
      lastResult: 0
    })
    expect(statsFromSummary({
      apsTestedCount: 2,
      apsPendingCount: 0,
      apsSuccessCount: 1
    } as unknown as NetworkHealthTest['summary'])).toEqual({
      apsFinishedTest: 2,
      apsUnderTest: 2,
      isOngoing: false,
      lastResult: 0.5
    })
    expect(statsFromSummary({
      apsTestedCount: 2,
      apsPendingCount: 0,
      apsSuccessCount: 2
    } as unknown as NetworkHealthTest['summary'])).toEqual({
      apsFinishedTest: 2,
      apsUnderTest: 2,
      isOngoing: false,
      lastResult: 1
    })
  })
})

describe('SubTitle', () => {
  const TestCompent = () => {
    const queryResults = useNetworkHealthTest()
    return <SubTitle queryResults={queryResults} />
  }
  it('should render', async () => {
    const serviceGuardTest = {
      ...fetchServiceGuardTest.serviceGuardTest,
      summary: {
        apsTestedCount: 2,
        apsPendingCount: 0,
        apsSuccessCount: 2
      }
    }
    mockGraphqlQuery( networkHealthApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest } })
    render(<TestCompent/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    await waitFor(() =>
      expect(screen.queryByText([
        'APs Under Test: 2 APs',
        'Test Result: 100% pass',
        'WLAN: Wifi Name',
        'Radio Band: 2.4 GHz',
        'Authentication Method: Pre-Shared Key (PSK)'
      ].join(' | '))).toBeVisible())
  })
  it('should render - on going test', async () => {
    const serviceGuardTest = {
      ...fetchServiceGuardTest.serviceGuardTest,
      summary: {
        apsTestedCount: 2,
        apsPendingCount: 2,
        apsSuccessCount: 0
      }
    }
    mockGraphqlQuery( networkHealthApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest } })
    render(<TestCompent/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    await waitFor(() =>
      expect(screen.queryByText([
        'APs Under Test: 0 of 2 APs tested',
        'Test Result: In progress...',
        'WLAN: Wifi Name',
        'Radio Band: 2.4 GHz',
        'Authentication Method: Pre-Shared Key (PSK)'
      ].join(' | '))).toBeVisible())
  })
  it('should handle when no data for test', async () => {
    const serviceGuardTest = {
      ...fetchServiceGuardTest.serviceGuardTest,
      config: { wlanName: '', radio: '', authenticationMethod: '' },
      summary: {}
    }
    mockGraphqlQuery( networkHealthApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest } })
    render(<TestCompent/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    await waitFor(() => expect(screen.queryByText([
      'WLAN: Unknown',
      'Radio Band: Unknown',
      'Authentication Method: Unknown'
    ].join(' | '))).toBeVisible())
  })
  it('should handle when no data (when loading)', async () => {
    mockGraphqlQuery(
      networkHealthApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest: null } })
    render(<TestCompent/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    await waitFor(() =>
      expect(screen.queryByText('Test details')).toBeVisible())
  })
})
