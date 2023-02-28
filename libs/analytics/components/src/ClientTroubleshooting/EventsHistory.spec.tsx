import { cleanup } from '@testing-library/react'

import { Incident }                  from '@acx-ui/analytics/utils'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { connectionEvents } from './__tests__/fixtures'
import { History }          from './EventsHistory'

import { Filters } from '.'

const incidents = [{
  id: '9cf271f8-fe98-4725-9ee3-baf89119164a',
  path: [{
    type: 'zone',
    name: 'cliexp4'
  }
  ],
  severity: 0.179645778294647,
  startTime: '2022-11-14T06:36:00.000Z',
  sliceType: 'zone',
  sliceValue: 'cliexp4',
  endTime: '2022-11-14T06:42:00.000Z',
  code: 'ttc',
  slaThreshold: 2000
}] as Incident[]
describe('EventsHistory', () => {
  afterEach(() => jest.restoreAllMocks())
  it('should render correctly without data', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'clientMac',
      activeTab: 'troubleshooting'
    }
    const data = {
      connectionEvents: [],
      incidents: [] as Incident[],
      connectionDetailsByAp: [],
      connectionQualities: []
    }
    const onPanelCallback = jest.fn(() => ({ onClick: () => {}, selected: () => false }))
    render(
      <Provider>
        <History
          data={data}
          filters={null}
          historyContentToggle
          setHistoryContentToggle={jest.fn()}
          onPanelCallback={onPanelCallback}
        />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/wifi/clients/:clientId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByText('History')).toBeVisible()
  })
  it('should render with data', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'clientMac',
      activeTab: 'troubleshooting'
    }
    const data = {
      connectionEvents,
      incidents,
      connectionDetailsByAp: [],
      connectionQualities: []
    }
    const onPanelCallback = jest.fn(() => ({ onClick: () => {}, selected: () => false }))
    render(
      <Provider>
        <History
          data={data}
          filters={{}}
          historyContentToggle
          setHistoryContentToggle={jest.fn()}
          onPanelCallback={onPanelCallback}
        />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/wifi/clients/:clientId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByText('History')).toBeVisible()
    expect(screen.getByText('Nov 14 2022 06:33:31')).toBeVisible()
    expect(screen.getByText('Connection (Time To Connect)')).toBeVisible()
  })
  it('should render with data and filters', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'clientMac',
      activeTab: 'troubleshooting'
    }
    const data = {
      connectionEvents,
      incidents,
      connectionDetailsByAp: [],
      connectionQualities: []
    }
    const filters = {
      category: ['performance'],
      type: ['roamed']
    } as unknown as Filters
    const onPanelCallback = jest.fn(() => ({ onClick: () => {}, selected: () => false }))
    render(
      <Provider>
        <History
          data={data}
          filters={filters}
          historyContentToggle
          setHistoryContentToggle={jest.fn()}
          onPanelCallback={onPanelCallback}
        />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/wifi/clients/:clientId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByText('History')).toBeVisible()
    expect(screen.getByText('Nov 14 2022 06:33:31')).toBeVisible()
    expect(screen.queryByText('Connection (Time To Connect)')).toBeNull()
    cleanup()

    render(
      <Provider>
        <History
          data={data}
          filters={{ ...filters, type: ['incident'], category: [] } as unknown as Filters}
          historyContentToggle
          setHistoryContentToggle={jest.fn()}
          onPanelCallback={onPanelCallback}
        />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/wifi/clients/:clientId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByText('History')).toBeVisible()
    expect(screen.queryByText('Nov 14 2022 06:33:31')).toBeNull()
    expect(screen.getByText('Connection (Time To Connect)')).toBeVisible()
  })
  it('should toggle history panel', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'clientMac',
      activeTab: 'troubleshooting'
    }
    const data = {
      connectionEvents: [],
      incidents: [] as Incident[],
      connectionDetailsByAp: [],
      connectionQualities: []
    }
    const setHistoryContentToggle = jest.fn()
    const onPanelCallback = jest.fn(() => ({ onClick: () => {}, selected: () => false }))
    render(
      <Provider>
        <History
          data={data}
          filters={null}
          historyContentToggle
          setHistoryContentToggle={setHistoryContentToggle}
          onPanelCallback={onPanelCallback}
        />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/wifi/clients/:clientId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByText('History')).toBeVisible()
    const collapse = screen.getByTestId('history-collapse')
    fireEvent.click(collapse)
    expect(setHistoryContentToggle).toBeCalledWith(false)
  })
  it('should handle event clicks', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'clientMac',
      activeTab: 'troubleshooting'
    }
    const data = {
      connectionEvents,
      incidents,
      connectionDetailsByAp: [],
      connectionQualities: []
    }
    const setHistoryContentToggle = jest.fn()
    const onClick = jest.fn(() => {})
    const onPanelCallback = jest.fn(() => ({ onClick, selected: () => true }))
    const scrollIntoView = jest.fn()
    const ogView = HTMLElement.prototype.scrollIntoView
    HTMLElement.prototype.scrollIntoView = scrollIntoView
    render(
      <Provider>
        <History
          data={data}
          filters={null}
          historyContentToggle
          setHistoryContentToggle={setHistoryContentToggle}
          onPanelCallback={onPanelCallback}
        />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/wifi/clients/:clientId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByText('History')).toBeVisible()
    const firstEvent =
      await screen.findByText('Client roamed @ R750-11-112 (94:B3:4F:3D:15:B0) 5 GHz')
    expect(firstEvent).toBeVisible()
    fireEvent.click(firstEvent)
    expect(onPanelCallback).toBeCalledTimes(4)
    expect(onClick).toBeCalledTimes(1)
    expect(scrollIntoView).toBeCalledTimes(3)
    HTMLElement.prototype.scrollIntoView = ogView
  })
})