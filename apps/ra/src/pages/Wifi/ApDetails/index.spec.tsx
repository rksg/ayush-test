import '@testing-library/jest-dom'

import { Provider, dataApi, dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery, render, screen }     from '@acx-ui/test-utils'

import ApDetails from '.'

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: () => <div data-testid={'some-report-id'} id='acx-report' />
}))

jest.mock('./ApAnalyticsTab', () => () => {
  return <div data-testid='ApAnalyticsTab' />
})

const apDetailsFixture = {
  network: {
    ap: {
      name: 'AP-Name',
      networkPath: [
        {
          name: 'Network',
          type: 'network'
        },
        {
          name: 'vsz34',
          type: 'system'
        },
        {
          name: '90:3A:72:24:D0:40',
          type: 'AP'
        }
      ]
    }
  }
}


describe('ApDetails', () => {
  beforeEach(() => {
    store.dispatch(dataApi.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'APDetails', {
      data: apDetailsFixture
    })
  })


  it('should render correctly', async () => {
    const params = {
      apId: 'ap-id'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/devices/wifi/:apId/details/ai' }
    })
    expect(await screen.findByText('AI Analytics')).toBeVisible()
    expect(await screen.findAllByRole('tab')).toHaveLength(2)
  })

  it('should navigate to analytic tab correctly', async () => {
    const params = {
      apId: 'ap-id',
      activeTab: 'ai'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/devices/wifi/:apId/details/:activeTab' }
    })

    expect((await screen.findAllByRole('tab', { selected: true }))[0]?.textContent)
      .toEqual('AI Analytics')
  })

  it('should navigate to reports tab correctly', async () => {
    const params = {
      apId: 'ap-id',
      activeTab: 'reports'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/devices/wifi/:apId/details/:activeTab' }
    })
    expect((await screen.findAllByRole('tab', { selected: true }))[0]?.textContent)
      .toEqual('Reports')
  })

})
