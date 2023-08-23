import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { Provider, dataApiURL, store }                                                    from '@acx-ui/store'
import { findTBody, mockGraphqlQuery, render, within, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { DateRange }                                                                      from '@acx-ui/utils'

import { configChanges }        from '../__tests__/fixtures'
import { ConfigChangeProvider } from '../context'
import { api }                  from '../services'

import { Table } from '.'

describe('Table', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })
  const handleClick = jest.fn()
  const setPagination = jest.fn()

  it('should render loader', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: [] } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days} setDateRange={jest.fn()}>
      <Table
        selected={null}
        onRowClick={handleClick}
        pagination={{ current: 1, pageSize: 10 }}
        setPagination={setPagination}
        dotSelect={null}
      />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(screen.getAllByRole('img', { name: 'loader' })).toBeTruthy()
  })

  it('should render table with no data', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: [] } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days} setDateRange={jest.fn()}>
      <Table
        selected={null}
        onRowClick={handleClick}
        pagination={{ current: 1, pageSize: 10 }}
        setPagination={setPagination}
        dotSelect={null}
      />
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
      { data: { network: { hierarchyNode: { configChanges } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days} setDateRange={jest.fn()}>
      <Table
        selected={null}
        onRowClick={handleClick}
        pagination={{ current: 1, pageSize: 10 }}
        setPagination={setPagination}
        dotSelect={null}
      />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    const tbody = await findTBody()
    expect(tbody).toBeVisible()
    const body = within(tbody)
    expect(await screen.findByRole('table')).toBeVisible()
    expect(await body.findAllByRole('row')).toHaveLength(9)
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
      { data: { network: { hierarchyNode: { configChanges } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days} setDateRange={jest.fn()}>
      <Table
        selected={null}
        onRowClick={handleClick}
        pagination={{ current: 1, pageSize: 10 }}
        setPagination={setPagination}
        dotSelect={null}
      />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    const radio = await screen.findAllByRole('radio')

    await userEvent.click(radio[0])

    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(handleClick).toHaveBeenCalledWith({
      children: undefined,
      id: 0,
      key: 'initialState.ccmAp.radio24g.radio.channel_fly_mtbc',
      name: '94:B3:4F:3D:21:80',
      newValues: ['480'],
      oldValues: [],
      timestamp: '1685427082900',
      type: 'ap'
    })
  })

  it('should handle kpi filter', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days} setDateRange={jest.fn()}>
      <Table
        selected={null}
        onRowClick={handleClick}
        pagination={{ current: 1, pageSize: 10 }}
        setPagination={setPagination}
        dotSelect={null}
      />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
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
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: {
        configChanges: configChanges.slice(0, 7).concat(new Array(10).fill(configChanges[7]))
      } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days} setDateRange={jest.fn()}>
      <Table
        selected={null}
        onRowClick={handleClick}
        pagination={{ current: 1, pageSize: 10 }}
        setPagination={setPagination}
        dotSelect={null}
      />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])
    await userEvent.click(await screen.findByText(2))
    expect(setPagination).toHaveBeenCalledTimes(1)
  })

  it('should select row when selected value is passed in', async () => {
    const selected = {
      id: 0,
      timestamp: '1685427082100',
      type: 'ap',
      name: '94:B3:4F:3D:21:80',
      key: 'initialState.ccmAp.radio24g.radio.channel_fly_mtbc',
      oldValues: [],
      newValues: ['480']
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days} setDateRange={jest.fn()}>
      <Table
        selected={selected}
        onRowClick={handleClick}
        pagination={{ current: 1, pageSize: 10 }}
        setPagination={setPagination}
        dotSelect={null}
      />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])
  })
})
