import { useContext } from 'react'

import userEvent from '@testing-library/user-event'

import { Provider, dataApiURL, store }                                                    from '@acx-ui/store'
import { findTBody, mockGraphqlQuery, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'
import { DateRange }                                                                      from '@acx-ui/utils'

import { pagedConfigChanges }                         from '../__tests__/fixtures'
import { ConfigChangeContext, ConfigChangeProvider }  from '../context'
import { DEFAULT_SORTER, PagedTable, transferSorter } from '../PagedTable'
import { SORTER_ABBR, api }                           from '../services'

describe('transferSorter', () => {
  it('should return correct result', () => {
    expect(transferSorter('ascend')).toBe(SORTER_ABBR.ASC)
    expect(transferSorter('descend')).toBe(SORTER_ABBR.DESC)
    expect(transferSorter('')).toBe(DEFAULT_SORTER.sortOrder)
  })
})

describe('Table', () => {
  const original = Date.now
  const data = pagedConfigChanges.data.map((value, id)=>({ ...value, id }))
  afterAll(() => Date.now = original)
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })
  it('should render loader', async () => {
    mockGraphqlQuery(dataApiURL, 'PagedConfigChange',
      { data: { network: { hierarchyNode: { pagedConfigChanges: { data: [], total: 0 } } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <PagedTable/>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(screen.getAllByRole('img', { name: 'loader' })).toBeTruthy()
  })
  it('should render table with no data', async () => {
    mockGraphqlQuery(dataApiURL, 'PagedConfigChange',
      { data: { network: { hierarchyNode: { pagedConfigChanges: { data: [], total: 0 } } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <PagedTable/>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    const tbody = await findTBody()
    expect(tbody).toBeVisible()
    const body = within(tbody)
    expect(await screen.findByRole('table')).toBeVisible()
    expect(await body.findAllByRole('row')).toHaveLength(1)
  })
  it('should render table with valid input', async () => {
    mockGraphqlQuery(dataApiURL, 'PagedConfigChange', { data: { network: { hierarchyNode: {
      pagedConfigChanges: { ...pagedConfigChanges, data } } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <PagedTable/>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    const tbody = await findTBody()
    expect(tbody).toBeVisible()
    const body = within(tbody)
    expect(await screen.findByRole('table')).toBeVisible()
    expect(await body.findAllByRole('row')).toHaveLength(10)
    expect(await screen.findByText('480')).toBeVisible()
    expect(await screen.findByText('Background scanning')).toBeVisible()
    expect(await screen.findByText('Auto')).toBeVisible()
    expect(await screen.findByText('true')).toBeVisible()
    expect(await screen.findByText('Default')).toBeVisible()
    expect(await screen.findByText('Enabled')).toBeVisible()
  })
  it('should handle row click correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'PagedConfigChange', { data: { network: { hierarchyNode: {
      pagedConfigChanges: { ...pagedConfigChanges, data } } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <PagedTable/>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    const radio = screen.queryAllByRole('radio')
    // eslint-disable-next-line testing-library/no-node-access
    expect(radio[0]?.parentNode).not.toHaveClass('ant-radio-checked')

    await userEvent.click(radio[0])

    // eslint-disable-next-line testing-library/no-node-access
    expect(radio[0]?.parentNode).toHaveClass('ant-radio-checked')
  })
  it('should handle pagination correctly', async () => {
    const TestComponent = () => {
      const { pagination } = useContext(ConfigChangeContext)
      return <div data-testid='pagination'>{JSON.stringify(pagination)}</div>
    }
    mockGraphqlQuery(dataApiURL, 'PagedConfigChange', { data: { network: { hierarchyNode: {
      pagedConfigChanges: { ...pagedConfigChanges, data } } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <div><PagedTable/><TestComponent/></div>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])
    expect(await screen.findByTestId('pagination'))
      .toHaveTextContent('{"current":1,"pageSize":10,"defaultPageSize":10,"total":0}')
    await userEvent.click(await screen.findByText(2))
    expect(await screen.findByTestId('pagination'))
      .toHaveTextContent('{"current":2,"pageSize":10,"defaultPageSize":10,"total":11}')
  })
  it('should handle sort correctly', async () => {
    const TestComponent = () => {
      const { sorter, setSorter } = useContext(ConfigChangeContext)
      return <>
        <div data-testid='sorter'>{sorter}</div>
        <div data-testid='setSorter'
          onClick={() => setSorter(null as unknown as SORTER_ABBR)}/>
      </>
    }
    mockGraphqlQuery(dataApiURL, 'PagedConfigChange', { data: { network: { hierarchyNode: {
      pagedConfigChanges: { ...pagedConfigChanges, data } } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <><PagedTable/><TestComponent/></>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    expect(await screen.findByTestId('sorter')).toHaveTextContent(SORTER_ABBR.DESC)
    await userEvent.click(await screen.findByText('Timestamp'))
    expect(await screen.findByTestId('sorter')).toHaveTextContent(SORTER_ABBR.ASC)
    await userEvent.click(await screen.findByText('Timestamp'))
    expect(await screen.findByTestId('sorter')).toHaveTextContent(SORTER_ABBR.DESC)
    await userEvent.click(await screen.findByText('Timestamp'))
    expect(await screen.findByTestId('sorter')).toHaveTextContent(SORTER_ABBR.ASC)
  })
  it('should select row when selected value is passed in', async () => {
    const TestComponent = () => {
      const { selected, setSelected } = useContext(ConfigChangeContext)
      return <>
        <div data-testid='selected'>{JSON.stringify(selected)}</div>
        <div data-testid='setSelected'
          onClick={() => setSelected(data[0])}/>
      </>
    }
    mockGraphqlQuery(dataApiURL, 'PagedConfigChange', { data: { network: { hierarchyNode: {
      pagedConfigChanges: { ...pagedConfigChanges, data } } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <><PagedTable/><TestComponent/></>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    const radio = screen.queryAllByRole('radio')
    // eslint-disable-next-line testing-library/no-node-access
    expect(radio[0]?.parentNode).not.toHaveClass('ant-radio-checked')

    await userEvent.click(await screen.findByTestId('setSelected'))

    // eslint-disable-next-line testing-library/no-node-access
    expect(radio[0]?.parentNode).toHaveClass('ant-radio-checked')
  })
  it('should handle query args', async () => {
    const TestComponent = () => {
      const {
        setEntityTypeFilter, setEntityNameSearch, setKpiFilter
      } = useContext(ConfigChangeContext)
      return <>
        <div data-testid='setEntityNameSearch' onClick={() =>setEntityNameSearch('search')}/>
        <div data-testid='setEntityTypeFilter' onClick={() =>setEntityTypeFilter(['ap'])}/>
        <div data-testid='setKpiFilter' onClick={() => setKpiFilter('kpikey1')}/>
      </>
    }
    mockGraphqlQuery(
      dataApiURL,
      'PagedConfigChange',
      { data: { network: { hierarchyNode: { pagedConfigChanges: { data: [], total: 0 } } } } },
      true
    )
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <div><PagedTable/><TestComponent/></div>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])
    await userEvent.click(await screen.findByTestId('setEntityNameSearch'))
    await userEvent.click(await screen.findByTestId('setEntityTypeFilter'))
    await userEvent.click(await screen.findByTestId('setKpiFilter'))
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])
  })
})