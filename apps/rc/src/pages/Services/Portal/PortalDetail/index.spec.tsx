import { rest } from 'msw'

import { PortalUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
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
  content: {
    welcomeText: 'Welcome to the Guest Access login page',
    welcomeColor: '#333333',
    bgImage: '',
    bgColor: '#FFFFFF',
    welcomeSize: 14,

    photoRatio: 170,

    logoRatio: 105,
    secondaryText: 'Lorem ipsum dolor sit amet, consectetur adipiscing'+
    ' elit. Aenean euismod bibendum laoreet.',
    secondaryColor: '#333333',
    secondarySize: 14,
    buttonColor: '#EC7100',
    poweredBgColor: '#FFFFFF',
    poweredColor: '#333333',
    poweredSize: 14,
    poweredImgRatio: 50,
    wifi4EUNetworkId: '',
    termsCondition: '',
    componentDisplay: {
      logo: true,
      welcome: true,
      photo: true,
      secondaryText: true,
      termsConditions: false,
      poweredBy: true,
      wifi4eu: false
    },
    displayLangCode: 'en',

    alternativeLang:

      { cs: true, zh_TW: false, fi: true,
        fr: true, de: true, el: true, hu: true, it: false }
  }
}

const detailChangeResult = {
  id: 1,
  serviceName: 'test',
  content: {
    welcomeText: 'Welcome to the Guest Access login page',
    welcomeColor: '#333333',
    bgColor: '#FFFFFF',
    welcomeSize: 14,
    logo: 'logo',
    photo: 'photo',
    bgImage: 'bgimage',
    poweredImg: 'poweredimg',
    photoRatio: 170,

    logoRatio: 105,
    secondaryText: 'Lorem ipsum dolor sit amet, consectetur adipiscing'+
    ' elit. Aenean euismod bibendum laoreet.',
    secondaryColor: '#333333',
    secondarySize: 14,
    buttonColor: '#EC7100',
    poweredBgColor: '#FFFFFF',
    poweredColor: '#333333',
    poweredSize: 14,
    poweredImgRatio: 50,
    wifi4EUNetworkId: '',
    termsCondition: '',
    componentDisplay: {
      logo: true,
      welcome: true,
      photo: true,
      secondaryText: true,
      termsConditions: false,
      poweredBy: true,
      wifi4eu: true
    },
    displayLangCode: 'en',

    alternativeLang:

      { cs: true, zh_TW: false, fi: true,
        fr: true, de: true, el: true, hu: true, it: false }
  }
}


describe('Portal Detail Page', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
      serviceId: '373377b0cb6e46ea8982b1c80aabe1fa'
    }
  })

  it('should render detail page', async () => {
    mockServer.use(
      rest.get(
        PortalUrlsInfo.getPortalNetworkInstances.url,
        (_, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        PortalUrlsInfo.getPortalProfileDetail.url,
        (_, res, ctx) => res(ctx.json(detailResult))
      ),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.status(404),ctx.json(
            'acceptTermsMsg = I accept the\nacceptTermsLink= terms & conditions'))
        })
    )
    render(<Provider><PortalServiceDetail /></Provider>, {
      route: { params, path: '/:tenantId/services/portal/:serviceId/detail' }
    })
    expect(await screen.findByText('English')).toBeVisible()
    expect(await screen.findByText((`Instances (${list.data.length})`))).toBeVisible()
    const body = await screen.findByRole('rowgroup', {
      name: (_, element) => element.classList.contains('ant-table-tbody')
    })
    await waitFor(() => expect(within(body).getAllByRole('row')).toHaveLength(4))
  })
  it('should render detail changed page', async () => {
    mockServer.use(
      rest.get(
        PortalUrlsInfo.getPortalNetworkInstances.url,
        (_, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        PortalUrlsInfo.getPortalProfileDetail.url,
        (_, res, ctx) => res(ctx.json(detailChangeResult))
      ),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.status(404),ctx.json(
            'acceptTermsMsg = I accept the\nacceptTermsLink= terms & conditions'))
        })
    )
    render(<Provider><PortalServiceDetail /></Provider>, {
      route: { params, path: '/:tenantId/services/portal/:serviceId/detail' }
    })
    expect(await screen.findByText('English')).toBeVisible()
    expect(await screen.findByText((`Instances (${list.data.length})`))).toBeVisible()
  })
})
