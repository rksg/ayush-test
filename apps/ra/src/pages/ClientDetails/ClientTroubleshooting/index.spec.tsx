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

describe('ClientTroubleshootingTab', () => {
  beforeEach(() => {
    mockGraphqlQuery(dataApiURL, 'ClientInfo', {
      data: {
        client: {
          connectionDetailsByAp: [],
          connectionEvents: [],
          connectionQualities: [],
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
        connectionQualities: [],
        incidents: []
      }
    } })

    const TestWrapper = () => {
      const { setDateFilter } = useDateFilter()
      useEffect(() => {
        setDateFilter({
          range: DateRange.custom,
          startDate: '02/01/2023',
          endDate: '02/01/2023'
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
