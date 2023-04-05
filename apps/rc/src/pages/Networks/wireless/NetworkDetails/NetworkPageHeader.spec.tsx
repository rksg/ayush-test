import '@testing-library/react'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import NetworkPageHeader from './NetworkPageHeader'


describe('NetworkPageHeader', () => {
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
})
