import { Provider, dataApi, dataApiURL, store }                         from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved  } from '@acx-ui/test-utils'

import SwitchDetails from '.'

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: () => <div data-testid={'some-report-id'} id='acx-report'>Report Content</div>
}))

jest.mock('./SwitchIncidentsTab', () => ({
  default: () => <div data-testid={'some-incident-id'}>Incident Content</div>
}))

const switchDetailsFixture = {
  network: {
    switch: {
      name: 'Switch-Name',
      networkPath: [
        {
          name: 'vsz34',
          type: 'system'
        },
        {
          type: 'switchGroup',
          name: 'MadySWITCH'
        },
        {
          name: '90:3A:72:24:D0:40',
          type: 'switch'
        }
      ]
    }
  }
}

describe('Switch Details', () => {
  beforeEach(() => {
    store.dispatch(dataApi.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'SwitchDetails', {
      data: switchDetailsFixture
    })
  })

  it('should render correctly', async () => {
    render(<SwitchDetails />, {
      wrapper: Provider,
      route: {
        params: { switchId: 'switch-id' }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByText('Wired')).toBeVisible()
    expect(screen.getByText('Switches')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Switch List' }))
      .toHaveAttribute('href', '/ai/devices/switch')
  })
  it('should navigate to incidents tab correctly', async () => {
    const params = {
      switchId: 'switchId',
      activeTab: 'incidents'
    }
    render(<Provider><SwitchDetails /></Provider>, {
      route: { params,
        path: '/devices/switch/:switchId/serial/details/:activeTab' }
    })
    expect(await screen.findByText('Incidents')).toBeVisible()
  })

  it('should navigate to reports tab correctly', async () => {
    const params = {
      switchId: 'switchId',
      activeTab: 'reports'
    }
    render(<Provider><SwitchDetails /></Provider>, {
      route: { params,
        path: '/devices/switch/:switchId/serial/details/:activeTab' }
    })
    expect(await screen.findByText('Reports')).toBeVisible()
  })
})
