/* eslint-disable testing-library/no-node-access */
import { get }                               from '@acx-ui/config'
import { dataApiURL, Provider, store }       from '@acx-ui/store'
import { render, screen, mockGraphqlQuery }  from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions } from '@acx-ui/user'
import { DateRange }                         from '@acx-ui/utils'
import type { AnalyticsFilter }              from '@acx-ui/utils'

import { healthWidgetFixture } from './__tests__/fixtures'
import { ClientExperience }    from './clientExperience'
import { api }                 from './services'

const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
describe('Client Experience', () => {
  let params = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
  const filters:AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'HealthWidget', {
      data: { network: { hierarchyNode: healthWidgetFixture } }
    })
    render( <Provider> <ClientExperience filters={filters}/></Provider>, {
      route: { params, path: '/:tenantId/venues' }
    })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render widget with proper data', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthWidget', {
      data: { network: { hierarchyNode: healthWidgetFixture } }
    })
    const { asFragment } = render( <Provider> <ClientExperience
      filters={filters}/></Provider>, {
      route: { params, path: '/:tenantId/venues' }
    })
    await screen.findByText('Connection Success')
    expect(asFragment()).toMatchSnapshot()
  })
  it('should hide arrow button when READ_HEALTH permission is false', async () => {
    mockGet.mockReturnValue('true')
    setRaiPermissions({ READ_HEALTH: false } as RaiPermissions)
    mockGraphqlQuery(dataApiURL, 'HealthWidget', {
      data: { network: { hierarchyNode: healthWidgetFixture } }
    })
    render( <Provider> <ClientExperience
      filters={filters}/></Provider>, {
      route: { params, path: '/:tenantId/venues' }
    })
    await screen.findByText('Connection Success')
    expect(screen.queryByTestId('ArrowChevronRight')).toBeNull()
  })
  it('should render for empty data', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthWidget', {
      data: { network: { hierarchyNode: {
        health: []
      } } }
    })
    const { asFragment } = render( <Provider>
      <ClientExperience filters={filters}/>
    </Provider>, {
      route: { params, path: '/:tenantId/venues' }
    })
    await screen.findByText('Connection Success')
    expect(asFragment()).toMatchSnapshot('NoData')
  })
})
