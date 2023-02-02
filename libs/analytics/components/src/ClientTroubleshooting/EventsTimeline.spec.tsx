import { Incident }                 from '@acx-ui/analytics/utils'
import { Provider }                 from '@acx-ui/store'
import { render, screen,fireEvent } from '@acx-ui/test-utils'

import { connectionEvents, connectionDetailsByAp, connectionQualities } from './__tests__/fixtures'
import  { TimeLine }                                                    from './EventsTimeline'
import { ConnectionEvent, ConnectionQuality }                           from './services'

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
},
{
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
  code: 'p-cov-clientrssi-low',
  slaThreshold: 2000
},
{
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
  code: 'i-net-time-future',
  slaThreshold: 2000
}
] as Incident[]

const connectionEventsArray: ConnectionEvent[] = [ ...connectionEvents,{
  timestamp: '2022-11-14T06:33:31.646Z',
  event: 'EVENT_CLIENT_INFO_UPDATED',
  ttc: null,
  mac: '94:B3:4F:3D:15:B0',
  apName: 'R750-11-112',
  path: [
    {
      type: 'zone',
      name: 'cliexp4'
    },
    {
      type: 'apGroup',
      name: 'No group (inherit from Venue)'
    },
    {
      type: 'ap',
      name: '94:B3:4F:3D:15:B0'
    }
  ],
  code: null,
  state: 'normal',
  failedMsgId: null,
  radio: '5'
},
{
  timestamp: '2022-11-14T06:33:31.646Z',
  event: 'EVENT_CLIENT_INFO_UPDATED',
  ttc: 4800,
  mac: '94:B3:4F:3D:15:B0',
  apName: 'R750-11-112',
  path: [
    {
      type: 'zone',
      name: 'cliexp4'
    },
    {
      type: 'apGroup',
      name: 'No group (inherit from Venue)'
    },
    {
      type: 'ap',
      name: '94:B3:4F:3D:15:B0'
    }
  ],
  code: null,
  state: 'normal',
  failedMsgId: null,
  radio: '5'
}]
describe('EventsTimeLine', () => {
  it('should render correctly with out search params', async () => {
    const params = {
      tenantId: 'tenant-id',
      userId: 'user-id',
      activeTab: 'troubleshooting'
    }
    const data = {
      connectionEvents,
      incidents,
      connectionDetailsByAp: connectionDetailsByAp,
      connectionQualities: connectionQualities as unknown as ConnectionQuality[]
    }
    render(
      <Provider>
        <TimeLine filters={{}}
          data={data}
        />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/aps/:userId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByText('Connection Events')).toBeVisible()
  })

  it('should render correctly with filters', async () => {
    const params = {
      tenantId: 'tenant-id',
      userId: 'user-id',
      activeTab: 'troubleshooting'
    }
    const filters = {
      category: ['performance'],
      type: [['info-updated'], ['disconnected'], ['failure'], ['roamed']]
    } as unknown as Filters
    const data = {
      connectionEvents: connectionEventsArray,
      incidents,
      connectionDetailsByAp: connectionDetailsByAp,
      connectionQualities: connectionQualities as unknown as ConnectionQuality[]
    }
    render(
      <Provider>
        <TimeLine filters={filters}
          data={data}
        />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/aps/:userId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByText('Connection Events')).toBeVisible()
  })

  it('should render all titles in the timeline', async () => {
    const params = {
      tenantId: 'tenant-id',
      userId: 'user-id',
      activeTab: 'troubleshooting'
    }
    const filters = {
      category: ['performance'],
      type: [['info-updated'], ['disconnected'], ['failure'], ['roamed']]
    } as unknown as Filters
    const data = {
      connectionEvents: connectionEventsArray,
      incidents,
      connectionDetailsByAp: connectionDetailsByAp,
      connectionQualities: connectionQualities as unknown as ConnectionQuality[]
    }
    render(
      <Provider>
        <TimeLine filters={filters}
          data={data}
        />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/aps/:userId/details/:activeTab'
        }
      }
    )
    expect((await screen.findAllByTestId('PlusSquareOutlined'))).toHaveLength(4)
  })
  it('should expand chart when click on expand icon', async () => {
    const params = {
      tenantId: 'tenant-id',
      userId: 'user-id',
      activeTab: 'troubleshooting'
    }
    const filters = {
      category: ['performance'],
      type: [['info-updated'], ['disconnected'], ['failure'], ['roamed']]
    } as unknown as Filters
    const data = {
      connectionEvents: connectionEventsArray,
      incidents,
      connectionDetailsByAp: connectionDetailsByAp,
      connectionQualities: connectionQualities as unknown as ConnectionQuality[]
    }
    render(
      <Provider>
        <TimeLine filters={filters}
          data={data}
        />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/aps/:userId/details/:activeTab'
        }
      }
    )
    fireEvent.click((await screen.findAllByTestId('PlusSquareOutlined'))[0] as HTMLElement)
    expect(await screen.findByText('Success')).toBeVisible()
    fireEvent.click((await screen.findAllByTestId('PlusSquareOutlined'))[0] as HTMLElement)
    expect(await screen.findByText('SinghAP-R610-MAP on 5GHz')).toBeVisible()
    fireEvent.click((await screen.findAllByTestId('PlusSquareOutlined'))[0] as HTMLElement)
    expect(await screen.findByText('RSS')).toBeVisible()
    fireEvent.click((await screen.findAllByTestId('PlusSquareOutlined'))[0] as HTMLElement)
    expect(await screen.findByText('Performance')).toBeVisible()
  })
  it('should collapse chart when click on collapse icon', async () => {
    const params = {
      tenantId: 'tenant-id',
      userId: 'user-id',
      activeTab: 'troubleshooting'
    }
    const filters = {
      category: ['performance'],
      type: [['info-updated'], ['disconnected'], ['failure'], ['roamed']]
    } as unknown as Filters
    const data = {
      connectionEvents: connectionEventsArray,
      incidents,
      connectionDetailsByAp: connectionDetailsByAp,
      connectionQualities: connectionQualities as unknown as ConnectionQuality[]
    }
    render(
      <Provider>
        <TimeLine filters={filters}
          data={data}
        />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/aps/:userId/details/:activeTab'
        }
      }
    )
    fireEvent.click((await screen.findAllByTestId('PlusSquareOutlined'))[0] as HTMLElement)
    fireEvent.click((await screen.findAllByTestId('MinusSquareOutlined'))[0] as HTMLElement)
    expect(screen.queryByText('Success')).toBe(null)
  })
  it('should show zero count when there is no data', async () => {
    const params = {
      tenantId: 'tenant-id',
      userId: 'user-id',
      activeTab: 'troubleshooting'
    }
    const filters = {
      category: ['performance'],
      type: [['info-updated'], ['disconnected'], ['failure'], ['roamed']]
    } as unknown as Filters
    const data = {
      connectionEvents: [],
      incidents,
      connectionDetailsByAp: connectionDetailsByAp,
      connectionQualities: connectionQualities as unknown as ConnectionQuality[]
    }
    render(
      <Provider>
        <TimeLine filters={filters}
          data={data}
        />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/aps/:userId/details/:activeTab'
        }
      }
    )
    expect((await screen.findAllByText('0'))[0]).toBeVisible()
  })
})
