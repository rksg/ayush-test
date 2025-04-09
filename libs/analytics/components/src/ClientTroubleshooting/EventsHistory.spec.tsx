import { Incident }                                from '@acx-ui/analytics/utils'
import { get }                                     from '@acx-ui/config'
import { Provider }                                from '@acx-ui/store'
import { act, render, screen, fireEvent, cleanup } from '@acx-ui/test-utils'
import { RolesEnum }                               from '@acx-ui/types'
import {
  getUserProfile,
  setUserProfile,
  RaiPermissions,
  setRaiPermissions
} from '@acx-ui/user'

import { connectionEvents } from './__tests__/fixtures'
import { History }          from './EventsHistory'

import { Filters } from '.'
import { AccountTier } from '@acx-ui/utils'
const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

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

const params = { tenantId: 'tenant-id', clientId: 'clientMac', activeTab: 'troubleshooting' }

describe('EventsHistory', () => {
  beforeEach(() => {
    mockGet.mockReturnValue(false)
  })
  afterEach(() => {
    jest.restoreAllMocks()
    cleanup()
  })
  it('should render correctly without data', async () => {
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
    expect(screen.getByText('11/14/2022 06:33:31')).toBeVisible()
    expect(screen.getByText('Connection (Time To Connect)')).toBeVisible()
    expect(screen.queryByRole('link')).toBeValid()
  })
  it('should render pcapIcon with data', async () => {
    const pcapEvents = connectionEvents.map((events, id) =>
      ({ ...events, pcapFilename: `${id}.pcap` }))
    const data = {
      connectionEvents: pcapEvents,
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
    expect(screen.getByText('11/14/2022 06:33:31')).toBeVisible()
    expect(screen.getByText('Connection (Time To Connect)')).toBeVisible()
    expect(screen.queryByRole('link')).toBeValid()
    expect(screen.getAllByTestId('DownloadOutlined')).toHaveLength(6)
  })
  it('should render with data and filters', async () => {
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
    expect(screen.getByText('11/14/2022 06:33:31')).toBeVisible()
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
  it('should toggle history panel with Core tier', async () => {
    const data = {
      connectionEvents: [],
      incidents: [] as Incident[],
      connectionDetailsByAp: [],
      connectionQualities: []
    }
    const setHistoryContentToggle = jest.fn()
    const onPanelCallback = jest.fn(() => ({ onClick: () => {}, selected: () => false }))
    setUserProfile({
      allowedOperations: [],
      profile: getUserProfile().profile,
      accountTier: AccountTier.CORE
    })

    render(
      <Provider>
        <History
          data={data}
          filters={null}
          historyContentToggle
          setHistoryContentToggle={setHistoryContentToggle}
          onPanelCallback={onPanelCallback}
          supportHistoryCollapse={false}
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
    expect(screen.queryByTestId('history-collapse')).toBeNull()
  })
  it('should handle event clicks', async () => {
    const data = {
      connectionEvents,
      incidents,
      connectionDetailsByAp: [],
      connectionQualities: []
    }
    const setHistoryContentToggle = jest.fn()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const onClick = jest.fn((_val: boolean) => {})
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
    const events = await screen.findAllByTestId('history-item-icon')
    expect(events).toBeTruthy()
    const firstEvent = events[0]
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => { fireEvent.click(firstEvent) })
    expect(onPanelCallback).toBeCalledTimes(7)
    expect(onClick).toBeCalledTimes(1)
    expect(scrollIntoView).toBeCalledTimes(6)
    HTMLElement.prototype.scrollIntoView = ogView
  })
  it('should hide link when role is READ_ONLY', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: { ...getUserProfile().profile, roles: [RolesEnum.READ_ONLY] }
    })
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
    expect(screen.getByText('11/14/2022 06:33:31')).toBeVisible()
    expect(screen.getByText('Connection (Time To Connect)')).toBeVisible()
    expect(screen.queryByRole('link')).toBeNull()
  })
  it('should hide incidents when role when user doesnt have permission', async () => {
    mockGet.mockReturnValue(true)
    setRaiPermissions({ READ_INCIDENTS: false } as RaiPermissions)
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
    expect(screen.getByText('11/14/2022 06:33:31')).toBeVisible()
    expect(screen.queryByText('Connection (Time To Connect)')).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
  })
})