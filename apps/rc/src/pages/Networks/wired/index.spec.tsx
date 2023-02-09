import '@testing-library/jest-dom'
import { rest } from 'msw'

import { SwitchUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'


import Wired from '.'

const profilesList = {
  data: [
    {
      acls: [
        {
          aclType: 'standard',
          id: 'f3932de82cfa42b49679e373dbc4631f',
          name: 'acl'
        }
      ],
      id: '991fc861eb104e499e7fe4664a0643bc',
      name: 'profile-test',
      profileType: 'Regular',
      vlans: [
        {
          arpInspection: false,
          id: 'bfff62925f164926a2d3dad60026d648',
          igmpSnooping: 'none',
          ipv4DhcpSnooping: false,
          spanningTreeProtocol: 'none',
          vlanId: 1234
        }
      ]
    },
    {
      id: '2c6a3dc8b4fd4f448207a172a0619c3f',
      name: 'testtt',
      profileType: 'CLI',
      venueCliTemplate: {
        cli: 'manager registrar\n gfgf',
        id: 'cfe85cb37cbb493494ac80d4f6687c71',
        name: 'testtt',
        overwrite: false,
        switchModels: 'ICX7150-24,ICX7150-48P'
      },
      venues: [
        'venue-cli'
      ]
    }
  ],
  page: 1,
  totalCount: 2,
  totalPages: 1
}

const cliList = {
  data: [
    {
      applyLater: true,
      cli: 'clock timezone us Pacific\nclock summer-time',
      id: '36e4d1dd8ab04cfb958aad3105e93aee',
      name: 'cli-test',
      reload: false
    }
  ],
  fields: [
    'name',
    'id',
    'venueSwitches'
  ],
  page: 1,
  totalCount: 1,
  totalPages: 1
}




describe('Wired', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(SwitchUrlsInfo.getProfiles.url,
        (_, res, ctx) => res(ctx.json(profilesList))),
      rest.post(SwitchUrlsInfo.getCliTemplates.url,
        (_, res, ctx) => res(ctx.json(cliList)))
    )
  })


  it('should render profiles correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      activeTab: 'profiles'
    }
    render(<Provider><Wired /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:activeTab' }
    })

    expect(await screen.findByText('Configuration Profiles')).toBeVisible()
    expect(await screen.findByText('profile-test')).toBeVisible()
  })

  it('should render onDemandCli correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      activeTab: 'onDemandCli'
    }
    render(<Provider><Wired /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:activeTab' }
    })

    expect(await screen.findByText('On-Demand CLI Configuration')).toBeVisible()
    expect(await screen.findByText('cli-test')).toBeVisible()
  })

})
