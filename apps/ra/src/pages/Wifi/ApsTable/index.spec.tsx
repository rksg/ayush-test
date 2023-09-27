import { Provider, dataApiSearchURL } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { APList } from '.'

describe('AP List Table', () => {
  const apList = { search: {
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
  }

  it('should render the ap table correctly', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: apList
    })

    render(<APList/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByText(/AL-Guest-R610/i)).toBeVisible()
  })

})
