import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { ConfigChange, TableProps }                                                       from '@acx-ui/components'
import { Provider, dataApiURL, store }                                                    from '@acx-ui/store'
import { findTBody, mockGraphqlQuery, render, within, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { DateRange }                                                                      from '@acx-ui/utils'

import { configChanges }        from '../__tests__/fixtures'
import { ConfigChangeProvider } from '../context'
import { api }                  from '../services'

import { downloadConfigChangeList, Table } from '.'

describe('Table', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })
  const handleClick = jest.fn()
  const setPagination = jest.fn()

  const legend = { 'AP': true, 'AP Group': true, 'Venue': true, 'WLAN': true, 'WLAN Group': true }
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
        legend={legend}
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
        legend={legend}
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
        legend={legend}
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

  it('should render table with legend filtered', async () => {
    const filteredLegend = {
      'AP': false,
      'AP Group': true,
      'Venue': true,
      'WLAN': false,
      'WLAN Group': true
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days} setDateRange={jest.fn()}>
      <Table
        selected={null}
        onRowClick={handleClick}
        pagination={{ current: 1, pageSize: 10 }}
        setPagination={setPagination}
        dotSelect={null}
        legend={filteredLegend}
      />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    const tbody = await findTBody()
    expect(tbody).toBeVisible()
    const body = within(tbody)
    expect(await screen.findByRole('table')).toBeVisible()
    expect(await body.findAllByRole('row')).toHaveLength(4)
    expect(screen.queryByText('AP')).toBeNull()
    expect(screen.queryByText('WLAN')).toBeNull()
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
        legend={legend}
      />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    const radio = await screen.findAllByRole('radio')

    await userEvent.click(radio[0])

    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(handleClick).toHaveBeenCalledWith({
      children: undefined,
      id: 0,
      filterId: 0,
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
        legend={legend}
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
        legend={legend}
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
        legend={legend}
      />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])
  })

  it('should render download button', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges } } } })

    render(<ConfigChangeProvider dateRange={DateRange.last7Days} setDateRange={jest.fn()}>
      <Table
        selected={null}
        onRowClick={handleClick}
        pagination={{ current: 1, pageSize: 10 }}
        setPagination={setPagination}
        dotSelect={null}
        legend={legend}
      />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })

    userEvent.click(await screen.findByTestId('DownloadOutlined'))
    expect(await screen.findByTestId('DownloadOutlined')).toBeInTheDocument()
  })
})

describe('CSV Functions', () => {
  const data = [{
    timestamp: '1732683083229',
    type: 'ap',
    name: '00:33:58:2B:97:30',
    key: 'initialState.ccmAp.radio_configs.radio6g.radio.wlan_service_enabled',
    oldValues: ['false'],
    newValues: ['true'],
    id: 3,
    filterId: 3
  }, {
    timestamp: '1732101890307',
    type: 'wlan',
    name: '##ML_AP-28651',
    key: 'initialState.CcmWlan.multi_link_operation.radio_6g_enabled',
    oldValues: ['false'],
    newValues: ['true'],
    id: 111,
    filterId: 111
  }, {
    timestamp: '1732095124567',
    type: 'zone',
    name: 'SERVICE_VALIDATION_TEST_7.1.1',
    key: 'initialState.ccmZone.version',
    oldValues: ['7.1.1.0.116'],
    newValues: ['7.1.1.0.126'],
    id: 114,
    filterId: 114
  }]
  const columns: TableProps<ConfigChange>['columns'] = [
    {
      title: 'Timestamp',
      width: 130,
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: {},
      defaultSortOrder: 'descend'
    },
    {
      title: 'Entity Type',
      width: 100,
      dataIndex: 'type',
      key: 'type',
      sorter: {},
      defaultSortOrder: 'descend',
      filterable: true
    },
    {
      title: 'Entity Name',
      key: 'name',
      dataIndex: 'name',
      sorter: {},
      defaultSortOrder: 'descend',
      searchable: true
    },
    {
      title: 'Configuration',
      key: 'key',
      dataIndex: 'key',
      sorter: {},
      defaultSortOrder: 'descend'
    },
    {
      title: 'Change From',
      key: 'oldValues',
      dataIndex: ['oldValues'],
      align: 'center',
      sorter: {},
      defaultSortOrder: 'descend'
    },
    {
      title: 'Change To',
      key: 'newValues',
      dataIndex: ['newValues'],
      align: 'center',
      sorter: {},
      defaultSortOrder: 'descend'
    }
  ]
  const originalBlob = global.Blob
  beforeEach(() => {
    global.Blob = jest.fn(() => ({
      type: 'text/csv;charset=utf-8;',
      arrayBuffer: jest.fn()
    } as unknown as Blob))

    global.URL.createObjectURL = jest.fn(() => 'mock-url')
  })
  afterEach(() => {
    global.Blob = originalBlob
  })
  it('downloadConfigChangeList triggers download correctly', () => {
    const downloadSpy = jest.fn()
    const anchorMock = document.createElement('a')
    jest.spyOn(document, 'createElement').mockReturnValue(anchorMock)
    anchorMock.click = downloadSpy
    downloadConfigChangeList(data, columns)
    expect(global.Blob).toHaveBeenCalledWith(
      // eslint-disable-next-line max-len
      ['"Timestamp","Entity Type","Entity Name","Configuration","Change From","Change To"\n"1732683083229","ap","00:33:58:2B:97:30","initialState.ccmAp.radio_configs.radio6g.radio.wlan_service_enabled","false","true"\n"1732101890307","wlan","##ML_AP-28651","initialState.CcmWlan.multi_link_operation.radio_6g_enabled","false","true"\n"1732095124567","zone","SERVICE_VALIDATION_TEST_7.1.1","initialState.ccmZone.version","7.1.1.0.116","7.1.1.0.126"\n'],
      { type: 'text/csv;charset=utf-8;' }
    )
  })
})
