import { rest } from 'msw'

import { AnalyticsFilter }                                 from '@acx-ui/analytics/utils'
import { EventParams }                                     from '@acx-ui/components'
import { EdgeUrlsInfo }                                    from '@acx-ui/rc/utils'
import { BrowserRouter, Path, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { Provider }                                        from '@acx-ui/store'
import { mockServer,render,renderHook,screen }             from '@acx-ui/test-utils'
import { DateRange }                                       from '@acx-ui/utils'

import { mockedTopEdgesTrafficData } from './__tests__/fixtures'

import { TopEdgesByTraffic, onClick } from '.'

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

describe('TopEdgesByTrafficWidget', () => {
  const filters : AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours,
    filter: {
      networkNodes: [[{ type: 'zone', name: 'testVenue' }]]
    }
  }
  const wrapper = (<BrowserRouter>
    <Provider>
      <TopEdgesByTraffic filters={filters}/>
    </Provider>
  </BrowserRouter>)

  it('should render chart', async () => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgesTopTraffic.url,
        (req, res, ctx) => res(ctx.json(mockedTopEdgesTrafficData))
      )
    )
    const { asFragment } =render(wrapper)
    await screen.findByText('Top 5 SmartEdges by Traffic')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })

  it('should render "No data to display" when data is empty', async () => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgesTopTraffic.url,
        (req, res, ctx) => res(ctx.json({ topTraffic: [] }))
      )
    )
    render(wrapper)
    expect(await screen.findByText('No data to display')).toBeVisible()
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