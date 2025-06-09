import '@testing-library/jest-dom'

import { PrivacyFeatureName }               from '@acx-ui/rc/utils'
import { dataApiURL, Provider, store }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'
import type { AnalyticsFilter }             from '@acx-ui/utils'

import { topApplicationsResponse } from './__tests__/fixtures'
import { api }                     from './services'

import { TopApplications } from '.'

// Mock the feature toggle and privacy settings hooks
jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: jest.fn()
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetPrivacySettingsQuery: jest.fn()
}))

jest.mock('@acx-ui/config', () => ({
  ...jest.requireActual('@acx-ui/config'),
  get: jest.fn()
}))

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtTokenPayload: jest.fn()
}))

describe('TopApplicationsWidget', () => {
  const filters : AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }

  const mockUseIsSplitOn = jest.requireMock('@acx-ui/feature-toggle')
    .useIsSplitOn
  const mockUseGetPrivacySettingsQuery = jest.requireMock('@acx-ui/rc/services')
    .useGetPrivacySettingsQuery
  const mockGet = jest.requireMock('@acx-ui/config').get
  const mockGetJwtTokenPayload = jest.requireMock('@acx-ui/utils')
    .getJwtTokenPayload

  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    mockGetJwtTokenPayload.mockReturnValue({ tenantId: 'test-tenant' })
    mockGet.mockReturnValue(false) // Default to not being RA
    mockUseIsSplitOn.mockReturnValue(true) // Default to feature flag enabled
    mockUseGetPrivacySettingsQuery.mockReturnValue({
      data: [{
        featureName: PrivacyFeatureName.APP_VISIBILITY,
        isEnabled: true,
        enforceDefault: false
      }]
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficPerClient', {
      data: topApplicationsResponse
    })
    render( <Provider> <TopApplications filters={filters} type='donut' /></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })

  it('should render donut chart when app visibility is enabled', async () => {
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficPerClient', {
      data: topApplicationsResponse
    })
    const { asFragment } = render(
      <Provider> <TopApplications filters={filters} type='donut' /></Provider>)
    await screen.findByText('Top 10 Applications by traffic volume')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })

  it('should render line chart when app visibility is enabled', async () => {
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficPerClient', {
      data: topApplicationsResponse
    })
    const { asFragment } = render(
      <Provider> <TopApplications filters={filters} type='line' /></Provider>)
    await screen.findByText('Top 10 Applications by traffic volume')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })

  it('should show no permission message when app visibility is disabled', async () => {
    mockUseGetPrivacySettingsQuery.mockReturnValue({
      data: [{
        featureName: PrivacyFeatureName.APP_VISIBILITY,
        isEnabled: false,
        enforceDefault: false
      }]
    })
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficPerClient', {
      data: topApplicationsResponse
    })
    render(<Provider> <TopApplications filters={filters} type='donut' /></Provider>)
    expect(await screen.findByText('No permission to view application data')).toBeVisible()
  })

  it('should show data when feature flag is disabled', async () => {
    mockUseIsSplitOn.mockReturnValue(false)
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficPerClient', {
      data: topApplicationsResponse
    })
    const { asFragment } = render(
      <Provider> <TopApplications filters={filters} type='donut' /></Provider>)
    await screen.findByText('Top 10 Applications by traffic volume')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })

  it('should show data when user is RA', async () => {
    mockGet.mockReturnValue(true)
    mockUseGetPrivacySettingsQuery.mockReturnValue({
      data: [{
        featureName: PrivacyFeatureName.APP_VISIBILITY,
        isEnabled: false,
        enforceDefault: false
      }]
    })
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficPerClient', {
      data: topApplicationsResponse
    })
    const { asFragment } = render(
      <Provider> <TopApplications filters={filters} type='donut' /></Provider>)
    await screen.findByText('Top 10 Applications by traffic volume')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })

  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficPerClient', {
      error: new Error('something went wrong!')
    })
    render( <Provider> <TopApplications filters={filters} type='donut' /> </Provider>)
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })

  it('should render "No data to display" when data is empty', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficPerClient', {
      data: { client: { topNApplicationByTraffic: [] } }
    })
    render( <Provider> <TopApplications filters={filters} type='donut' /> </Provider>)
    expect(await screen.findByText('No data to display')).toBeVisible()
    jest.resetAllMocks()
  })
})
