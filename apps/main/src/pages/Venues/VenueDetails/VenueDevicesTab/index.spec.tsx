import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo, Dashboard }  from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { VenueDetails } from '../'

jest.mock(
  'analytics/Widgets',
  () => <div data-testid='analytics/Widgets' />,
  { virtual: true })

const data: Dashboard = {
  summary: {
    clients: {
      summary: {
        '4c778ed630394b76b17bce7fe230cf9f': 1
      },
      clientDto: [
        {
          healthCheckStatus: 'Good',
          venueId: '4c778ed630394b76b17bce7fe230cf9f',
          ipAddress: '10.206.1.137',
          osType: 'Windows'
        }
      ],
      totalCount: 1
    },
    aps: {
      summary: {
        '2_Operational': 1,
        '3_RequiresAttention': 1
      },
      totalCount: 2
    },
    alarms: {
      summary: {
        clear: 3
      },
      totalCount: 3
    },
    switches: {
      summary: {
        OFFLINE: '1'
      },
      totalCount: 1
    },
    venues: {
      summary: {
        '1_InSetupPhase': 4,
        '3_RequiresAttention': 1
      },
      totalCount: 5
    },
    switchClients: {
      summary: {
        '4c778ed630394b76b17bce7fe230cf9f': '0'
      },
      totalCount: 0
    }
  },
  aps: {
    apsStatus: [
      {
        '4c778ed630394b76b17bce7fe230cf9f': {
          totalCount: 2,
          apStatus: {
          }
        }
      }
    ],
    totalCount: 2
  },
  switches: {
    switchesStatus: [
      {
        '4c778ed630394b76b17bce7fe230cf9f': {
          switchStatus: {
            OFFLINE: 1
          },
          totalCount: 1
        }
      }
    ],
    totalCount: 1
  },
  venues: [
    {
      '01b1fe5d153d4a2a90455795af6ad877': {
        country: 'Singapore',
        city: 'Singapore',
        crtTime: '1662457287550',
        timeZone: 'Asia/Singapore',
        type: 'venue',
        lastUpdTime: '1662457287550',
        name: 'airport',
        tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
        id: '01b1fe5d153d4a2a90455795af6ad877'
      }
    },
    {
      b2efc20b6d2b426c836d76110f88941b: {
        country: 'United States',
        city: 'Sunnyvale, California',
        description: 'fd',
        crtTime: '1663125126647',
        timeZone: 'America/Los_Angeles',
        lastUpdTime: '1663125126647',
        name: 'dsfds',
        tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
        id: 'b2efc20b6d2b426c836d76110f88941b'
      }
    },
    {
      f27f33e0475d4f49af57350fed788c7b: {
        country: 'Singapore',
        city: 'Singapore',
        crtTime: '1662457551804',
        timeZone: 'Asia/Singapore',
        type: 'venue',
        lastUpdTime: '1662457551804',
        name: 'SG office',
        tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
        id: 'f27f33e0475d4f49af57350fed788c7b'
      }
    }
  ]
}

const venueDetailHeaderData = {
  venue:
    {
      country: 'United States',
      switchProfileId: '41ca86a61e50424eab1d4e3a7a501f48',
      city: 'New York',
      latitude: '40.7690084',
      description: '',
      crtTime: '1657256362351',
      timeZone: 'America/New_York',
      addressLine: '1093 Main St, New York, NY, 10044, United States',
      type: 'venue',
      rogueDetection: {
        policyId: '79c439e1e5474f68acc9da38fa08a37b',
        policyName: 'Default profile',
        enabled: true
      },
      lastUpdTime: '1657256362351',
      switchProfileName: '7150-c12p',
      wifiFirmwareVersion: '6.2.0.103.443',
      name: 'My-Venue',
      tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
      id: '4c778ed630394b76b17bce7fe230cf9f',
      venueStatus: '3_RequiresAttention',
      mesh: {
        enabled: false
      },
      dhcp: {
        mode: 'DHCPMODE_EACH_AP',
        enabled: false
      },
      longitude: '-73.9431541'
    },
  totalClientCount: '1',
  aps: {
    summary: {
      '2_Operational': 1,
      '3_RequiresAttention': 1
    },
    totalApCount: 2,
    detail: {
      '2_Operational': [
        { serialNumber: '302002015736',name: '302002015736-0802' }
      ],
      '3_RequiresAttention': [
        { serialNumber: '123423422222',name: 'mock-ap1' }
      ]
    }
  },
  activeNetworkCount: 7,
  switches: {
    summary: {
      OFFLINE: 1
    },
    totalCount: 1
  },
  lteAps: {
    summary: {},
    totalApCount: 0,
    detail: {}
  },
  switchClients: {
    totalCount: 0
  },
  activeLteNetworkCount: 0
}

const meshData = {
  fields: ['clients','serialNumber','apDownRssis','downlink','IP','apUpRssi','apMac',
    'venueName','meshRole','uplink','venueId','name','apUpMac','apRssis','model','hops','cog'],
  page: 1,
  totalCount: 0,
  data: [
    {
      serialNumber: '981604906462',
      name: 'AP-981604906462',
      model: 'R710',
      venueId: '8caa8f5e01494b5499fa156a6c565138',
      venueName: 'Ada',
      IP: '192.168.34.237',
      apMac: '74:3E:2B:30:1E:70',
      meshRole: 'RAP',
      hops: 0,
      uplink: [],
      downlink: [{
        serialNumber: '321602105278',
        name: 'AP-321602105278',
        model: 'R510',
        venueId: '8caa8f5e01494b5499fa156a6c565138',
        venueName: 'Ada',
        IP: '192.168.34.203',
        apMac: 'EC:8C:A2:32:88:93',
        meshRole: 'MAP',
        hops: 3,
        txFrames: '3847',
        rssi: 78,
        rxBytes: '495421',
        txBytes: '787581',
        rxFrames: '1726',
        type: 2,
        downMac: 'ec:8c:a2:32:88:93',
        uplink: [],
        downlink: []
      }]
    },
    {
      serialNumber: '321602105275',
      name: 'AP-321602105275',
      model: 'R510',
      venueId: '8caa8f5e01494b5499fa156a6c565138',
      venueName: 'Ada',
      IP: '192.168.34.201',
      apMac: 'EC:8C:A2:32:88:90',
      meshRole: 'MAP',
      hops: 1,
      uplink: [],
      downlink: []
    },
    {
      serialNumber: '481503905523',
      name: 'AP-481503905523',
      model: 'R600',
      venueId: '8caa8f5e01494b5499fa156a6c565138',
      venueName: 'Ada',
      IP: '192.168.34.234',
      apMac: 'F8:E7:1E:25:9F:D0',
      meshRole: 'EMAP',
      hops: 2,
      uplink: [],
      downlink: []
    }
  ] }

describe('VenueMeshAps', () => {
  let params: { tenantId: string, venueId: string, activeTab: string }
  beforeEach(() => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getDashboardOverview.url,
        (req, res, ctx) => res(ctx.json(data))
      ),
      rest.get(
        CommonUrlsInfo.getVenueDetailsHeader.url,
        (req, res, ctx) => res(ctx.json(venueDetailHeaderData))
      ),
      rest.post(
        CommonUrlsInfo.getMeshAps.url,
        (req, res, ctx) => res(ctx.json(meshData))
      )
    )

    params = {
      tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
      venueId: '8caa8f5e01494b5499fa156a6c565138',
      activeTab: 'devices'
    }
  })

  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/venue-details/:activeTab' }
    })

    expect(asFragment()).toMatchSnapshot()

    await screen.findByText('R710')

  })
})
