import '@testing-library/jest-dom'

import { useContext } from 'react'

import userEvent from '@testing-library/user-event'

import { get }                                                                            from '@acx-ui/config'
import { useIsSplitOn }                                                                   from '@acx-ui/feature-toggle'
import { Provider, dataApiURL, store }                                                    from '@acx-ui/store'
import { findTBody, mockGraphqlQuery, render, within, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { DateRange }                                                                      from '@acx-ui/utils'

import { configChanges }                             from '../__tests__/fixtures'
import { ConfigChangeContext, ConfigChangeProvider } from '../context'
import { api }                                       from '../services'

import { downloadConfigChangeList } from './download'

import { Table } from '.'

const mockGet = jest.mocked(get)
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

const mockDownload = jest.mocked(downloadConfigChangeList)
jest.mock('./download', () => ({
  downloadConfigChangeList: jest.fn()
}))

describe('Table', () => {
  const data = configChanges
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .map((value, id)=>({ ...value, id }))
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    mockGet.mockReturnValue('true')
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })
  it('should render loader', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: [] } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <Table/>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(screen.getAllByRole('img', { name: 'loader' })).toBeTruthy()
  })

  it('should render table with no data', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: [] } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <Table/>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    const tbody = await findTBody()
    expect(tbody).toBeVisible()
    const body = within(tbody)
    expect(await screen.findByRole('table')).toBeVisible()
    expect(await body.findAllByRole('row')).toHaveLength(1)
  })

  it('should render table with valid input', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: data } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <Table/>
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
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: data } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <Table/>
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
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: data } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}><Table/></ConfigChangeProvider>,
      { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    await userEvent.click(await screen.findByText('Add KPI filter'))
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(await screen.findByText('Name')).toBeVisible()
    expect(await screen.findByText('BSS Min. Rate')).toBeVisible()

    await userEvent.click(await screen.findByText('Add KPI filter'))
    await userEvent.click(
      await screen.findByRole('menuitemcheckbox', { name: 'Client Throughput' }))
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(screen.queryByText('Name')).toBeNull()
    expect(await screen.findByText('BSS Min. Rate')).toBeVisible()
  })

  it('should handle pagination correctly', async () => {
    const TestComponent = () => {
      const { pagination } = useContext(ConfigChangeContext)
      return <div>{JSON.stringify(pagination)}</div>
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: data } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <div><Table/><TestComponent/></div>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])
    expect(await screen.findByText(/"current":1/)).toBeVisible()
    await userEvent.click(await screen.findByText(2))
    expect(await screen.findByText(/"current":2/)).toBeVisible()
  })

  it('should render table with legend filtered', async () => {
    const TestComponent = () => {
      const { applyLegendFilter } = useContext(ConfigChangeContext)
      return <div onClick={() => { applyLegendFilter({
        'AP': false, 'AP Group': true, 'Zone': true, 'WLAN': false, 'WLAN Group': true,
        'IntentAI': true
      })
      }}>Test</div>
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: data } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <div><Table/><TestComponent/></div>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    await userEvent.click(await screen.findByText('Test'))

    const tbody = await findTBody()
    expect(tbody).toBeVisible()
    const body = within(tbody)
    expect(await screen.findByRole('table')).toBeVisible()
    expect(await body.findAllByRole('row')).toHaveLength(6)
    expect(screen.queryByText('AP')).toBeNull()
    expect(screen.queryByText('WLAN')).toBeNull()
  })

  it('should select row when selected value is passed in', async () => {
    const TestComponent = () => {
      const { setSelected } = useContext(ConfigChangeContext)
      return <div onClick={() => { setSelected(data[1])
      }}>Test</div>
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: data } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <div><Table/><TestComponent/></div>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    const radio = screen.queryAllByRole('radio')
    // eslint-disable-next-line testing-library/no-node-access
    expect(radio[1]?.parentNode).not.toHaveClass('ant-radio-checked')

    await userEvent.click(await screen.findByText('Test'))

    // eslint-disable-next-line testing-library/no-node-access
    expect(radio[1]?.parentNode).toHaveClass('ant-radio-checked')
  })

  it('should render download button', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: data } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <Table/>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('DownloadOutlined')).toBeInTheDocument()
    await userEvent.click(await screen.findByTestId('DownloadOutlined'))
    expect(mockDownload).toBeCalledTimes(1)
  })
})
