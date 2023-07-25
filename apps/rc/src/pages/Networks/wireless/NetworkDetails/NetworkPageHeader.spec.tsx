import '@testing-library/react'
import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import NetworkPageHeader from './NetworkPageHeader'


describe.skip('NetworkPageHeader', () => {
  it('should render correctly in overview', async () => {
    render(
      <Provider>
        <NetworkPageHeader />,
      </Provider>,
      {
        route: {
          params: {
            tenantId: 'testId',
            networkId: 'test',
            activeTab: 'overview'
          }
        }
      }
    )
    const dateFilter = await screen.findAllByPlaceholderText('Start date')
    expect(dateFilter).toHaveLength(1)
  })

  it('should render without datefilter in aps/venue', async () => {
    render(
      <Provider>
        <NetworkPageHeader />,
      </Provider>,
      {
        route: {
          params: {
            tenantId: 'testId',
            networkId: 'test',
            activeTab: 'aps'
          }
        }
      }
    )
    const dateFilter = screen.queryByPlaceholderText('Start date')
    expect(dateFilter).not.toBeInTheDocument()
  })

  it('should render breadcrumb correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <NetworkPageHeader />,
      </Provider>,
      {
        route: {
          params: {
            tenantId: 'testId',
            networkId: 'test',
            activeTab: 'overview'
          }
        }
      }
    )
    expect(screen.getByRole('link', {
      name: /networks/i
    })).toBeTruthy()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <NetworkPageHeader />,
      </Provider>,
      {
        route: {
          params: {
            tenantId: 'testId',
            networkId: 'test',
            activeTab: 'overview'
          }
        }
      }
    )
    expect(await screen.findByText('Wi-Fi')).toBeVisible()
    expect(await screen.findByText('Wi-Fi Networks')).toBeVisible()
    expect(screen.getByRole('link', {
      name: /network list/i
    })).toBeTruthy()
  })
})
