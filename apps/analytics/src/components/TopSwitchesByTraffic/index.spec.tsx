import { TooltipComponentFormatterCallbackParams } from 'echarts'
import { BrowserRouter }                           from 'react-router-dom'

import { dataApiURL }                       from '@acx-ui/analytics/services'
import { AnalyticsFilter }                  from '@acx-ui/analytics/utils'
import { EventParams }                      from '@acx-ui/components'
import { Path, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { Provider, store }                  from '@acx-ui/store'
import { render, renderHook, screen }       from '@acx-ui/test-utils'
import { mockGraphqlQuery, mockDOMWidth }   from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import { topSwitchesByTrafficResponse } from './__tests__/fixtures'
import { api }                          from './services'

import SwitchesByTraffic, { tooltipFormatter, onClick } from '.'

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
  range: DateRange.last24Hours,
  filter: {}
} as AnalyticsFilter

describe('TopSwitchesByTrafficWidget', () => {
  mockDOMWidth()

  const wrapper = (<BrowserRouter>
    <Provider>
      <SwitchesByTraffic filters={filters}/>
    </Provider>
  </BrowserRouter>)

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'SwitchesByTraffic', {
      data: topSwitchesByTrafficResponse
    })
    render(wrapper)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'SwitchesByTraffic', {
      data: topSwitchesByTrafficResponse
    })
    const { asFragment } =render(wrapper)
    await screen.findByText('Top 5 Switches by Traffic')
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'SwitchesByTraffic', {
      error: new Error('something went wrong!')
    })
    render(wrapper)
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
  it('should render "No data to display" when data is empty', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'SwitchesByTraffic', {
      data: { network: { hierarchyNode: { topNSwitchesByTraffic: [] } } }
    })
    render(wrapper)
    expect(await screen.findByText('No data to display')).toBeVisible()
    jest.resetAllMocks()
  })

  it('should return correct Html string for the tooltip', async () => {
    const singleparameters = [{
      data: [
        'Switch 1',
        53,
        7.3
      ]
    }] as TooltipComponentFormatterCallbackParams
    expect(tooltipFormatter(singleparameters)).toMatchSnapshot()
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
