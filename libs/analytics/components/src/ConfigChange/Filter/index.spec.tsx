import userEvent from '@testing-library/user-event'

import { getConfigChangeEntityTypeMapping }          from '@acx-ui/components'
import { Provider, dataApiURL, store }               from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitFor } from '@acx-ui/test-utils'
import { DateRange, defaultRanges }                  from '@acx-ui/utils'

import { pagedConfigChanges }                                                 from '../__tests__/fixtures'
import { ConfigChangeContext, ConfigChangeContextType, ConfigChangeProvider } from '../context'
import { api }                                                                from '../services'

import { handleConfigChangeDownload } from './handleConfigChangeDownload'

import { Search, KPIFilter, EntityTypeFilter, Reset, Download, Filter, ResetZoom } from '.'

const mockHandleConfigChangeDownload = jest.mocked(handleConfigChangeDownload)
jest.mock('./handleConfigChangeDownload', () => ({
  handleConfigChangeDownload: jest.fn()
}))

describe('Search', () => {
  it('should render correctly', async () => {
    const context = { setEntityNameSearch: jest.fn() } as unknown as ConfigChangeContextType
    render( <ConfigChangeContext.Provider value={context} children={<Search/>} />)
    expect(await screen.findByPlaceholderText('Search Scope')).toBeVisible()
    await userEvent.type(screen.getByRole('textbox'), 'search')
    expect(context.setEntityNameSearch).toBeCalled()
  })
})

describe('KPIFilter', () => {
  it('should render correctly', async () => {
    const context = {
      kpiFilter: [],
      applyKpiFilter: jest.fn()
    } as unknown as ConfigChangeContextType
    render(<ConfigChangeContext.Provider value={context} children={<KPIFilter/>}/>)
    await userEvent.click(await screen.findByText('KPI'))
    await userEvent.click(
      await screen.findByRole('menuitemcheckbox', { name: 'Client Throughput' }))
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(await screen.findByText('Client Throughput')).toBeVisible()
    expect(context.applyKpiFilter).toBeCalledWith(['clientThroughput'])
  })
  it('should render default', async () => {
    const context = {
      kpiFilter: ['clientThroughput'],
      applyKpiFilter: jest.fn()
    } as unknown as ConfigChangeContextType
    render(<ConfigChangeContext.Provider value={context} children={<KPIFilter/>}/>)
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector('div[title="Client Throughput"]')).not.toBeNull()
  })
  it('should handle empty', async () => {
    const context = {
      kpiFilter: [],
      applyKpiFilter: jest.fn()
    } as unknown as ConfigChangeContextType
    render(<ConfigChangeContext.Provider value={context} children={<KPIFilter/>}/>)
    await userEvent.click(await screen.findByText('KPI'))
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(await screen.findByText('KPI')).toBeVisible()
    expect(context.applyKpiFilter).toBeCalledWith([])
  })
})

describe('EntityTypeFilter', () => {
  it('should render correctly', async () => {
    const context = {
      entityTypeFilter: [],
      setEntityTypeFilter: jest.fn()
    } as unknown as ConfigChangeContextType
    render( <ConfigChangeContext.Provider value={context} children={<EntityTypeFilter/>} />)
    await userEvent.click(await screen.findByText('Entity'))
    await userEvent.click(await screen.findByRole('menuitemcheckbox', { name: 'AP' }))
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(await screen.findByText('AP')).toBeVisible()
    expect(context.setEntityTypeFilter).toBeCalledWith(['ap'])
  })
  it('should render default', async () => {
    const context = {
      entityTypeFilter: ['ap'],
      setEntityTypeFilter: jest.fn()
    } as unknown as ConfigChangeContextType
    render(<ConfigChangeContext.Provider value={context} children={<EntityTypeFilter/>} />)
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector('div[title="AP"]')).not.toBeNull()
  })
  it('should handle empty', async () => {
    const context = {
      entityTypeFilter: [],
      setEntityTypeFilter: jest.fn()
    } as unknown as ConfigChangeContextType
    render( <ConfigChangeContext.Provider value={context} children={<EntityTypeFilter/>} />)
    await userEvent.click(await screen.findByText('Entity'))
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(await screen.findByText('Entity')).toBeVisible()
    expect(context.setEntityTypeFilter).toBeCalledWith([])
  })
})

describe('Reset', () => {
  it('should hide Reset when no filter parameters', async () => {
    const context = {
      entityTypeFilter: [],
      kpiFilter: [],
      entityNameSearch: ''
    } as unknown as ConfigChangeContextType
    render( <ConfigChangeContext.Provider value={context} children={<Reset/>} />)
    expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument()
  })
  it('should show Reset when has filter parameters', async () => {
    const context = {
      entityTypeFilter: [],
      kpiFilter: [],
      entityNameSearch: 'search'
    } as unknown as ConfigChangeContextType
    render( <ConfigChangeContext.Provider value={context} children={<Reset/>} />)
    expect(await screen.findByText('Clear Filters')).toBeVisible()
  })
  it('should call resetFilter when click', async () => {
    const context = {
      resetFilter: jest.fn(),
      entityTypeFilter: [],
      kpiFilter: [],
      entityNameSearch: 'search'
    } as unknown as ConfigChangeContextType
    render( <ConfigChangeContext.Provider value={context} children={<Reset/>} />)
    expect(await screen.findByText('Clear Filters')).toBeVisible()
    await userEvent.click(await screen.findByText('Clear Filters'))
    expect(context.resetFilter).toBeCalled()
  })
})

describe('ResetZoom', () => {
  it('should not render with zoom disable', () => {
    const context = {
      initialZoom: { start: 100, end: 100 },
      chartZoom: { start: 100, end: 100 }
    } as unknown as ConfigChangeContextType
    render(<ConfigChangeContext.Provider value={context} children={<ResetZoom/>}/>)
    expect(screen.queryByText('Reset Zoom')).not.toBeInTheDocument()
  })
  it('should render with zoom enabled', async () => {
    const context = {
      setChartZoom: jest.fn(),
      initialZoom: { start: 100, end: 100 },
      chartZoom: { start: 100, end: 101 }
    } as unknown as ConfigChangeContextType
    render(<ConfigChangeContext.Provider value={context} children={<ResetZoom/>}/>)
    expect(await screen.findByText('Reset Zoom')).toBeVisible()
    await userEvent.click(await screen.findByText('Reset Zoom'))
    expect(context.setChartZoom).toBeCalled()
  })
})

describe('Download', () => {
  const data = pagedConfigChanges.data.map((value, id)=>({ ...value, id }))
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })
  it('should render download button and generate download data', async () => {
    const context = {
      pagination: { total: data.length },
      timeRanges: defaultRanges()[DateRange.last7Days],
      kpiFilter: [], entityNameSearch: '', entityTypeFilter: [],
      entityList: getConfigChangeEntityTypeMapping(false).map(item => item.key)
    } as unknown as ConfigChangeContextType
    mockGraphqlQuery(dataApiURL, 'ConfigChangeSeries', { data: { network: { hierarchyNode: {
      configChanges: data } } } })
    render(
      <ConfigChangeContext.Provider value={context} children={<Download/>} />,
      { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('DownloadOutlined')).toBeInTheDocument()
    await userEvent.click(await screen.findByTestId('DownloadOutlined'))
    await new Promise(r => setTimeout(r, 1))
    expect(mockHandleConfigChangeDownload).toBeCalledTimes(1)
  })
  it('should disable download button when no data', async () => {
    const context = {
      pagination: { total: 0 },
      timeRanges: defaultRanges()[DateRange.last7Days],
      kpiFilter: [], entityNameSearch: '', entityTypeFilter: ['ap'],
      entityList: getConfigChangeEntityTypeMapping(false).map(item => item.key)
    } as unknown as ConfigChangeContextType
    render(
      <ConfigChangeContext.Provider value={context} children={<Download/>} />,
      { wrapper: Provider, route: {} })
    const icon = await screen.findByTestId('DownloadOutlined')
    expect(icon).toBeInTheDocument()
    // eslint-disable-next-line testing-library/no-node-access
    expect(icon.parentNode).toBeDisabled()
  })
  it('should catch error when download fail', async () => {
    const spy = jest.spyOn(console, 'error')
    spy.mockReset()
    const context = {
      pagination: { total: data.length },
      timeRanges: defaultRanges()[DateRange.last7Days],
      kpiFilter: [], entityNameSearch: '', entityTypeFilter: [],
      entityList: getConfigChangeEntityTypeMapping(false).map(item => item.key)
    } as unknown as ConfigChangeContextType
    mockGraphqlQuery(dataApiURL, 'ConfigChangeSeries', { error: 'some-error' })
    render(
      <ConfigChangeContext.Provider value={context} children={<Download/>} />,
      { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('DownloadOutlined')).toBeInTheDocument()
    await userEvent.click(await screen.findByTestId('DownloadOutlined'))
    await new Promise(r => setTimeout(r, 1))
    await waitFor(() => { expect(spy).toBeCalledTimes(1) })
  })
})

describe('Ftiler', () => {
  it('should render correct layout', async () => {
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <Filter/>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(await screen.findByPlaceholderText('Search Scope')).toBeVisible()
    await userEvent.type(screen.getByRole('textbox'), 'search')
    expect(await screen.findByText('KPI')).toBeVisible()
    expect(await screen.findByText('Entity')).toBeVisible()
    expect(await screen.findByText('Clear Filters')).toBeVisible()
    expect(await screen.findByTestId('DownloadOutlined')).toBeInTheDocument()
  })
})

