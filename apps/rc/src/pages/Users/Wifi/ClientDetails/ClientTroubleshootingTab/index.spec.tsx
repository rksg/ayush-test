
import { useEffect } from 'react'

import { dataApiURL, Provider } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'
import { DateRange, useDateFilter } from '@acx-ui/utils'

import { ClientTroubleshootingTab } from './index'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  overlapsRollup: jest.fn().mockReturnValue(false)
}))

describe('ClientTroubleshootingTab', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2023-02-21T00:00:00.000Z').getTime())
    mockGraphqlQuery(dataApiURL, 'ClientInfo', {
      data: {
        client: {
          connectionDetailsByAp: [],
          connectionEvents: [],
          connectionQualities: []
        }
      }
    })
    mockGraphqlQuery(dataApiURL, 'ClientIncidentsInfo', {
      data: {
        client: {
          incidents: []
        }
      }
    })
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'client-mac',
      activeTab: 'troubleshooting'
    }

    mockGraphqlQuery(dataApiURL, 'ClientInfo', { data: {
      client: {
        connectionDetailsByAp: [],
        connectionEvents: [],
        connectionQualities: []
      }
    } })

    mockGraphqlQuery(dataApiURL, 'ClientIncidentsInfo', {
      data: {
        client: {
          incidents: []
        }
      }
    })

    const TestWrapper = () => {
      const { setDateFilter } = useDateFilter()
      useEffect(() => {
        setDateFilter({
          range: DateRange.custom,
          startDate: '2023-02-01T00:00:00.000Z',
          endDate: '2023-02-01T00:00:00.000Z'
        })
      }, [])
      return <Provider><ClientTroubleshootingTab /></Provider>
    }

    const { asFragment } = render(<TestWrapper />, {
      route: {
        params,
        path: '/:tenantId/t/users/wifi/:clientId/details/:activeTab'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('All Categories')).toBeVisible()
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
      .forEach((node:Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    fragment.querySelectorAll('text[transform^="translate"]')
      .forEach((node:Element) => node.setAttribute('transform', 'transform_mock'))
    fragment.querySelectorAll('path[transform^="translate"]')
      .forEach((node:Element) => node.setAttribute('transform', 'transform_mock'))
    expect(fragment).toMatchSnapshot()
  })
})
