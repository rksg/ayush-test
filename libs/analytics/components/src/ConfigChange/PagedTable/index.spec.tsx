import { useContext } from 'react'

import userEvent from '@testing-library/user-event'

import { get }                                                                            from '@acx-ui/config'
import { useAnySplitsOn }                                                                 from '@acx-ui/feature-toggle'
import { Provider, dataApiURL, store }                                                    from '@acx-ui/store'
import { findTBody, mockGraphqlQuery, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions }                                              from '@acx-ui/user'
import { DateRange }                                                                      from '@acx-ui/utils'

import { pagedConfigChanges }                         from '../__tests__/fixtures'
import { ConfigChangeContext, ConfigChangeProvider }  from '../context'
import { DEFAULT_SORTER, PagedTable, transferSorter } from '../PagedTable'
import { SORTER_ABBR, api }                           from '../services'

const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  ...jest.requireActual('@acx-ui/config'),
  get: jest.fn()
}))

const mockedUseTenantLink = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useTenantLink: () => mockedUseTenantLink
}))

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
    mockGet.mockReturnValue(false)
    jest.mocked(useAnySplitsOn).mockReturnValue(false)
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
  describe('should render hyperlink', () => {
    beforeEach(() => {
      jest.mocked(useAnySplitsOn).mockReturnValue(true)
      mockGraphqlQuery(dataApiURL, 'PagedConfigChange', { data: { network: { hierarchyNode: {
        pagedConfigChanges: { ...pagedConfigChanges, data } } } } })
    })
    it('should render correct hyperlink for intentAI', async () => {
      render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
        <PagedTable/>
      </ConfigChangeProvider>, { wrapper: Provider, route: { params: { tenantId: 'test' } } })
      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])
      expect(await screen.findByRole('link')).toHaveAttribute(
        // eslint-disable-next-line max-len
        'href', '/test/t/analytics/intentAI/b4187899-38ae-4ace-8e40-0bc444455156/c-bgscan5g-enable')
    })
    it('should render correct hyperlink for SA', async () => {
      mockGet.mockReturnValue(true)
      setRaiPermissions({ READ_INTENT_AI: true } as RaiPermissions)
      render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
        <PagedTable/>
      </ConfigChangeProvider>, { wrapper: Provider, route: {} })
      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])
      expect(await screen.findByRole('link')).toHaveAttribute(
        // eslint-disable-next-line max-len
        'href', '/intentAI/30b11d8b-ce40-4344-81ef-84b47753b4a6/b4187899-38ae-4ace-8e40-0bc444455156/c-bgscan5g-enable')
    })
    it('should not render hyperlink for SA but not have permission', async () => {
      mockGet.mockReturnValue(true)
      setRaiPermissions({ READ_INTENT_AI: false } as RaiPermissions)
      render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
        <PagedTable/>
      </ConfigChangeProvider>, { wrapper: Provider, route: {} })
      expect(screen.queryByText('link')).not.toBeInTheDocument()
    })
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
