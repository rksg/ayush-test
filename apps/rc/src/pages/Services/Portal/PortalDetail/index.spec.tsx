import { rest } from 'msw'

import { PortalUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import PortalServiceDetail from '.'

const list = {
  fields: [
    'id',
    'network',
    'venues',
    'health',
    'abandonmentRate',
    'clients',
    'clientsPortal'
  ],
  totalCount: 10,
  page: 1,
  data: [
    {
      id: '1',
      network: {
        id: '6',
        name: 'Network A',
        captiveType: 'Guest Pass'
      },
      venues: 4,
      health: 70,
      abandonmentRate: 77,
      clients: 88,
      clientsPortal: 91
    },
    {
      id: '7',
      network: {
        id: '3b11bcaffd6f4f4f9b2805b6fe24bf8d',
        name: 'Network B',
        captiveType: 'Guest Pass'
      },
      venues: 3,
      health: 95,
      abandonmentRate: 96,
      clients: 64,
      clientsPortal: 75
    },
    {
      id: '8',
      network: {
        id: '3b11bcaffd6f4f4f9b2805b6fe24bf8f',
        name: 'Network C',
        captiveType: 'Self Sign In'
      },
      venues: 7,
      health: 3,
      abandonmentRate: 80,
      clients: 86,
      clientsPortal: 90
    },
    {
      id: '4',
      network: {
        id: '3b11bcaffd6f4f4f9b2805b6fe24bf8g',
        name: 'Network E',
        captiveType: 'Self Sign In'
      },
      venues: 6,
      health: 1,
      abandonmentRate: 85,
      clients: 70,
      clientsPortal: 93
    }
  ]
}
const detailResult = {
  id: 1,
  serviceName: 'test',
  demo: {
    welcomeText: 'Welcome to the Guest Access login page',
    welcomeColor: '#333333',
    backgroundImage: '',
    backgroundColor: '#FFFFFF',
    welcomeSize: 14,

    photoSize: 170,

    logoSize: 105,
    secondaryText: 'Lorem ipsum dolor sit amet, consectetur adipiscing'+
    ' elit. Aenean euismod bibendum laoreet.',
    secondaryColor: '#333333',
    secondarySize: 14,
    buttonColor: '#EC7100',
    poweredBackgroundColor: '#FFFFFF',
    poweredColor: '#333333',
    poweredSize: 14,
    poweredImgSize: 50,
    wifi4EU: '',
    termsCondition: '',
    componentDisplay: {
      Logo: true,
      WelcomeText: true,
      Photo: true,
      SecondaryText: true,
      TermsConditions: false,
      PoweredBy: true,
      WiFi4EU: false
    },
    displayLang: 'English',

    alternativeLang:

      { Czech: true, ChineseTraditional: false, Finnish: true,
        French: true, German: true, Greek: true, Hungarian: true, Italian: false }
  }
}




describe('Portal Detail Page', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
      serviceId: '373377b0cb6e46ea8982b1c80aabe1fa'
    }
    mockServer.use(
      rest.get(
        PortalUrlsInfo.getPortalNetworkInstances.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        PortalUrlsInfo.getPortalProfileDetail.url,
        (req, res, ctx) => res(ctx.json(detailResult))
      )
    )
  })

  it('should render detail page', async () => {

    const { asFragment } = render(
      <Provider>
        <PortalServiceDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/services/portal/:serviceId/detail' }
      })
    await screen.findByText((`Instances (${list.data.length})`))
    await screen.findByRole('heading', { level: 4, name: 'Language' })
    expect(asFragment()).toMatchSnapshot()
  })

})
