import { serviceGuardApiURL, Provider }     from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { fetchServiceGuardTest } from '../../__tests__/fixtures'

import { Title, SubTitle } from '.'

describe('Title', () => {
  it('should render', async () => {
    mockGraphqlQuery(
      serviceGuardApiURL, 'FetchServiceGuardTest', { data: fetchServiceGuardTest })
    render(<Title/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    expect(await screen.findByText('name')).toBeVisible()
  })
  it('should handle when no data', async () => {
    mockGraphqlQuery(
      serviceGuardApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest: null } })
    render(<Title/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    expect(await screen.findByText('Test')).toBeVisible()
  })
})

describe('SubTitle', () => {
  it('should render', async () => {
    const serviceGuardTest = {
      ...fetchServiceGuardTest.serviceGuardTest,
      summary: {
        apsTestedCount: 2,
        apsPendingCount: 0,
        apsSuccessCount: 2
      }
    }
    mockGraphqlQuery( serviceGuardApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest } })
    render(<SubTitle/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    expect(await screen.findByText([
      'APs Under Test: 2',
      'Test Result: 100% pass',
      'Network: Wifi Name',
      'Radio Band: 2.4 GHz',
      'Authentication Method: Pre-Shared Key (PSK)'
    ].join(' | '))).toBeVisible()
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
    mockGraphqlQuery( serviceGuardApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest } })
    render(<SubTitle/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    expect(await screen.findByText([
      'APs Under Test: 0 of 2 APs tested',
      'Test Result: In progress...',
      'Network: Wifi Name',
      'Radio Band: 2.4 GHz',
      'Authentication Method: Pre-Shared Key (PSK)'
    ].join(' | '))).toBeVisible()
  })
  it('should handle when no data for test', async () => {
    const serviceGuardTest = {
      ...fetchServiceGuardTest.serviceGuardTest,
      config: { wlanName: '', radio: '', authenticationMethod: '' },
      summary: {}
    }
    mockGraphqlQuery( serviceGuardApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest } })
    render(<SubTitle/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    expect(await screen.findByText([
      'Network: Unknown',
      'Radio Band: Unknown',
      'Authentication Method: Unknown'
    ].join(' | '))).toBeVisible()
  })
  it('should handle when no data (when loading)', async () => {
    mockGraphqlQuery(
      serviceGuardApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest: null } })
    render(<SubTitle/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    expect(await screen.findByText('Test details')).toBeVisible()
  })
})
