import { dataApiURL }                                      from '@acx-ui/analytics/services'
import { AnalyticsFilter }                                 from '@acx-ui/analytics/utils'
import { EventParams }                                     from '@acx-ui/components'
import { BrowserRouter, Path, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { Provider, store }                                 from '@acx-ui/store'
import { render, renderHook, screen }                      from '@acx-ui/test-utils'
import { mockGraphqlQuery, mockAutoSizer }                 from '@acx-ui/test-utils'
import { DateRange }                                       from '@acx-ui/utils'

import { topSwitchesByPoEUsageResponse } from './__tests__/fixtures'
import { api }                           from './services'

import SwitchesByPoEUsage, { onClick } from '.'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))


const filters = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours
} as AnalyticsFilter

describe('TopSwitchesByPoEUsageWidget', () => {
  mockAutoSizer()

  const wrapper = (<BrowserRouter>
    <Provider> 
      <SwitchesByPoEUsage filters={filters}/>
    </Provider>
  </BrowserRouter>)

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'SwitchesByPoEUsage', {
      data: topSwitchesByPoEUsageResponse
    })
    render(wrapper)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'SwitchesByPoEUsage', {
      data: topSwitchesByPoEUsageResponse
    })
    const { asFragment } =render(wrapper)
    await screen.findByText('Top 5 Switches by PoE Usage')
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'SwitchesByPoEUsage', {
      error: new Error('something went wrong!')
    })
    render(wrapper)
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
  it('should render "No data to display" when data is empty', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'SwitchesByPoEUsage', {
      data: { network: { hierarchyNode: { topNSwitchesByPoEUsage: [] } } }
    })
    render(wrapper)
    expect(await screen.findByText('No data to display')).toBeVisible()
    jest.resetAllMocks()
  })

  it('should handle onClick',() => {
    const { result: basePath } = renderHook(
      () => useTenantLink('/some/path?another=param')
    )
    const { result: navigate } = renderHook(
      () => useNavigate()
    )
    const handleOnClick = onClick(navigate.current,basePath.current)
    const param = { componentType: 'series', value: [1,2,3] } as EventParams
    handleOnClick(param)
    expect(mockedUseNavigate).toHaveBeenCalled()
  })

})
