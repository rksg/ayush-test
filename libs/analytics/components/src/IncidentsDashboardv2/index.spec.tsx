import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'

import { IncidentFilter }              from '@acx-ui/analytics/utils'
import { Provider, store, dataApiURL } from '@acx-ui/store'
import {
  cleanup,
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
}                    from '@acx-ui/test-utils'
import { RolesEnum }                      from '@acx-ui/types'
import { getUserProfile, setUserProfile } from '@acx-ui/user'
import { DateRange }                      from '@acx-ui/utils'

import { expectedIncidentDashboardData } from './__tests__/fixtures'
import { api }                           from './services'

import { IncidentsDashboardv2 } from '.'

const filters : IncidentFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  filter: {}
}

describe('IncidentDashboardv2', () => {

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  afterEach(() => cleanup())

  it('should render incident severity data', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsDashboardWidget', {
      data: { network: { hierarchyNode: expectedIncidentDashboardData } }
    })
    const { asFragment } = render(
      <BrowserRouter>
        <Provider>
          <IncidentsDashboardv2 filters={filters} />
        </Provider>
      </BrowserRouter>)
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(screen.queryByTestId('ArrowChevronRight')).toBeValid()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should hide arrow button when role is READ_ONLY', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: { ...getUserProfile().profile, roles: [RolesEnum.READ_ONLY] }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentsDashboardWidget', {
      data: { network: { hierarchyNode: expectedIncidentDashboardData } }
    })
    render(
      <BrowserRouter>
        <Provider>
          <IncidentsDashboardv2 filters={filters} />
        </Provider>
      </BrowserRouter>)
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(screen.queryByTestId('ArrowChevronRight')).toBeNull()
  })
  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsDashboardWidget', {
      data: { network: { hierarchyNode: expectedIncidentDashboardData } }
    })
    render(
      <BrowserRouter>
        <Provider>
          <IncidentsDashboardv2 filters={filters} />
        </Provider>
      </BrowserRouter>
    )
    expect(screen.queryByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
      error: new Error('something went wrong!')
    })
    mockGraphqlQuery(dataApiURL, 'IncidentsDashboardWidget', {
      data: { network: { hierarchyNode: [] } }
    })
    render(
      <BrowserRouter>
        <Provider>
          <IncidentsDashboardv2 filters={filters} />
        </Provider>
      </BrowserRouter>
    )
    await screen.findByText('No reported incidents')
    jest.resetAllMocks()
  })
  it('should render message when no data', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsDashboardWidget', {
      data: { network: { hierarchyNode: [] } }
    })
    render(
      <BrowserRouter>
        <Provider>
          <IncidentsDashboardv2 filters={filters} />
        </Provider>
      </BrowserRouter>
    )
    await screen.findByText('No reported incidents')
  })
})
