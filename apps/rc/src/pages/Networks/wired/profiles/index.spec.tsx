import '@testing-library/jest-dom'
import { rest } from 'msw'

import { SwitchUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { ProfilesTab } from '.'



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

describe('Wired', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(SwitchUrlsInfo.getProfiles.url,
        (_, res, ctx) => res(ctx.json(profilesList)))
    )
  })


  it('should render profiles correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      activeTab: 'profiles'
    }
    render(<Provider><ProfilesTab /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:activeTab' }
    })

    expect(await screen.findByText('Add Regular Profile')).toBeVisible()
    expect(await screen.findByText('profile-test')).toBeVisible()
  })

})
