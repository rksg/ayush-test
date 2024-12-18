import { useContext } from 'react'

import userEvent from '@testing-library/user-event'

import { Provider, dataApiURL, store }                                                             from '@acx-ui/store'
import { findTBody, mockGraphqlQuery, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'
import { DateRange }                                                                               from '@acx-ui/utils'

import { pagedConfigChanges }                         from '../__tests__/fixtures'
import { ConfigChangeContext, ConfigChangeProvider }  from '../context'
import { DEFAULT_SORTER, PagedTable, transferSorter } from '../PagedTable'
import { SORTER_ABBR, api }                           from '../services'

import { genDownloadConfigChange } from './download'

const mockGenDownloadConfigChange = jest.mocked(genDownloadConfigChange)
jest.mock('./download', () => ({
  genDownloadConfigChange: jest.fn()
}))

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    showArrow,                // remove and left unassigned to prevent warning
    showSearch,               // remove and left unassigned to prevent warning
    allowClear,               // remove and left unassigned to prevent warning
    maxTagCount,              // remove and left unassigned to prevent warning
    dropdownMatchSelectWidth, // remove and left unassigned to prevent warning
    filterOption,             // remove and left unassigned to prevent warning
    ...props
  }: React.PropsWithChildren<{
    showArrow: boolean,
    showSearch: boolean,
    allowClear:boolean,
    maxTagCount: number,
    dropdownMatchSelectWidth: boolean,
    filterOption: () => void,
    onChange?: (value: string) => void }>) => {
    return (<select {...props} onChange={(e) => props.onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>)
  }
  Select.Option = 'option'
  return { ...components, Select }
})

describe('transferSorter', () => {
  it('should return correct result', () => {
    expect(transferSorter('ascend')).toBe(SORTER_ABBR.ASC)
    expect(transferSorter('descend')).toBe(SORTER_ABBR.DESC)
    expect(transferSorter('')).toBe(DEFAULT_SORTER.sortOrder)
  })
})

describe('Table', () => {
  const data = pagedConfigChanges.data.map((value, id)=>({ ...value, id }))
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    // mockGet.mockReturnValue('true')
    // jest.mocked(useIsSplitOn).mockReturnValue(true)
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

    expect(await screen.findByText('Add KPI filter')).toBeVisible()
  })
  it('should handle click correctly', async () => {
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
  it('should handle kpi filter', async () => {
    const TestComponent = () => {
      const { kpiFilter } = useContext(ConfigChangeContext)
      return <div data-testid='kpiFilter'>{JSON.stringify(kpiFilter)}</div>
    }
    mockGraphqlQuery(dataApiURL, 'PagedConfigChange', { data: { network: { hierarchyNode: {
      pagedConfigChanges: { ...pagedConfigChanges, data } } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <><PagedTable/><TestComponent/></>
    </ConfigChangeProvider>,
    { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    await userEvent.click(await screen.findByText('Add KPI filter'))
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(await screen.findByTestId('kpiFilter')).toHaveTextContent('[]')

    await userEvent.click(await screen.findByText('Add KPI filter'))
    await userEvent.click(
      await screen.findByRole('menuitemcheckbox', { name: 'Client Throughput' }))
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(await screen.findByTestId('kpiFilter')).toHaveTextContent('["clientThroughput"]')
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
  it('should handle filter correctly', async () => {
    const TestComponent = () => {
      const { entityNameSearch, entityTypeFilter } = useContext(ConfigChangeContext)
      return <>
        <div data-testid='entityNameSearch'>{entityNameSearch}</div>
        <div data-testid='entityTypeFilter'>{JSON.stringify(entityTypeFilter)}</div>
      </>
    }
    mockGraphqlQuery(dataApiURL, 'PagedConfigChange', { data: { network: { hierarchyNode: {
      pagedConfigChanges: { ...pagedConfigChanges, data } } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <div><PagedTable/><TestComponent/></div>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    expect(await screen.findByTestId('entityNameSearch')).toHaveTextContent('')
    await userEvent.type(screen.getByRole('textbox'),'ABC')
    await waitFor(async () => {
      expect(await screen.findByTestId('entityNameSearch')).toHaveTextContent('ABC')
    })

    expect(await screen.findByTestId('entityTypeFilter')).toHaveTextContent('[]')
    await userEvent.selectOptions(
      (await screen.findAllByRole('combobox'))[1],
      await screen.findByRole('option', { name: 'AP' })
    )
    await waitFor(async () => {
      expect(await screen.findByTestId('entityTypeFilter')).toHaveTextContent('["ap"]')
    })
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
  it('should render download button and generate download data', async () => {
    mockGraphqlQuery(dataApiURL, 'PagedConfigChange', { data: { network: { hierarchyNode: {
      pagedConfigChanges: { ...pagedConfigChanges, data } } } } })
    mockGraphqlQuery(dataApiURL, 'ConfigChange', { data: { network: { hierarchyNode: {
      configChanges: data } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <PagedTable/>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('DownloadOutlined')).toBeInTheDocument()
    await userEvent.click(await screen.findByTestId('DownloadOutlined'))
    await new Promise(r => setTimeout(r, 1))
    expect(mockGenDownloadConfigChange).toBeCalledTimes(1)
  })
  it('should catch error when download fail', async () => {
    const spy = jest.spyOn(console, 'error')
    spy.mockReset()
    mockGraphqlQuery(dataApiURL, 'PagedConfigChange', { data: { network: { hierarchyNode: {
      pagedConfigChanges: { ...pagedConfigChanges, data } } } } })
    mockGraphqlQuery(dataApiURL, 'ConfigChange', { error: 'some-error' })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <PagedTable/>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('DownloadOutlined')).toBeInTheDocument()
    await userEvent.click(await screen.findByTestId('DownloadOutlined'))
    await new Promise(r => setTimeout(r, 1))
    await waitFor(() => { expect(spy).toBeCalledTimes(1) })
  })
})