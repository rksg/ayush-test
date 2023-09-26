import { rest } from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, dataApiSearchURL }   from '@acx-ui/store'
import {
  logRoles,
  mockGraphqlQuery,
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import useApsTable from '.'

jest.mock('@acx-ui/rc/components', () => {
  const { forwardRef } = jest.requireActual('react')
  return {
    ...jest.requireActual('@acx-ui/rc/components'),
    ApTable: forwardRef(() => <div data-testid={'ApTable'}></div>)
  }
})

describe('AP List Table', () => {
  const apList = {
    aps: [
      {
        apName: 'AL-Guest-R610',
        macAddress: '90:3A:72:24:D0:40',
        apModel: 'R610',
        ipAddress: '192.168.2.105',
        version: '6.1.2.0.580',
        apZone: 'Albert-Home-Main',
        networkPath: [
          {
            name: 'Network',
            type: 'network'
          },
          {
            name: 'vsz34',
            type: 'system'
          },
          {
            name: '04-US-CA-D4-Albert-Home',
            type: 'domain'
          },
          {
            name: 'Albert-Home-Main',
            type: 'zone'
          },
          {
            name: 'default',
            type: 'apGroup'
          },
          {
            name: '90:3A:72:24:D0:40',
            type: 'AP'
          }
        ]
      },
      {
        apName: 'BDC-Test AP Feb',
        macAddress: '58:FB:96:01:A5:A0',
        apModel: 'R350',
        ipAddress: '192.168.1.26',
        version: 'Unknown',
        apZone: '45-IN-BDC-D45-AM',
        networkPath: [
          {
            name: 'Network',
            type: 'network'
          },
          {
            name: 'vsz34',
            type: 'system'
          },
          {
            name: '45-IN-BDC-D45-AM',
            type: 'zone'
          },
          {
            name: 'default',
            type: 'apGroup'
          },
          {
            name: '58:FB:96:01:A5:A0',
            type: 'AP'
          }
        ]
      },
      {
        apName: 'GuestHouse@SD',
        macAddress: '34:20:E3:2D:11:20',
        apModel: 'H550',
        ipAddress: '192.168.1.67',
        version: '6.1.1.0.1274',
        apZone: 'TommySD@Home',
        networkPath: [
          {
            name: 'Network',
            type: 'network'
          },
          {
            name: 'vsz34',
            type: 'system'
          },
          {
            name: '49-US-CA-TommySD',
            type: 'domain'
          },
          {
            name: 'TommySD@Home',
            type: 'zone'
          },
          {
            name: 'default',
            type: 'apGroup'
          },
          {
            name: '34:20:E3:2D:11:20',
            type: 'AP'
          }
        ]
      }
    ]
  }

  // beforeEach(() => {
  //   mockServer.use(
  //     rest.post(
  //       CommonUrlsInfo.getApsList.url,
  //       (req, res, ctx) => res(ctx.json(list))
  //     ),
  //     rest.post(
  //       WifiUrlsInfo.addAp.url,
  //       (req, res, ctx) => res(ctx.json({
  //         txId: 'f83cdf6e-df01-466d-88ba-58e2f2c211c6'
  //       }))
  //     ),
  //     rest.post(
  //       WifiUrlsInfo.getApGroupsList.url,
  //       (req, res, ctx) => res(ctx.json({ data: [] }))
  //     ),
  //     rest.post(
  //       CommonUrlsInfo.getVenuesList.url,
  //       (req, res, ctx) => res(ctx.json({ data: [] }))
  //     )
  //   )
  // })

  it('should render page correctly', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: apList
    })
    const Component = () => {
      const { component } = useApsTable()
      return component
    }

    const { container } = render(<Component/>, { wrapper: Provider, route: {} })
    screen.logTestingPlaygroundURL(container)
    logRoles(container)
    expect(screen.getByText(/ap name/i)).toBeVisible()
  })

  // it('should render title with count correctly', async () => {
  //   const Title = () => {
  //     const { title } = useApsTable()
  //     return <span>{title}</span>
  //   }
  //   render(<Title/>, { wrapper: Provider, route: {} })
  //   expect(await screen.findByText('AP List (2)')).toBeVisible()
  // })

  // it.skip('should render extra header correctly', async () => {
  //   const Component = () => {
  //     const { headerExtra } = useApsTable()
  //     return <span>{headerExtra}</span>
  //   }
  //   render(<Component/>, { wrapper: Provider, route: {} })
  //   expect(await screen.findByText('Add')).toBeVisible()
  // })
})
