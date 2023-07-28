import { rest } from 'msw'

import { CommonUrlsInfo, PortalUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
import {
  findTBody,
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
  totalCount: 4,
  page: 1,
  data: [
    {
      id: '1',
      name: 'NetA',
      nwSubType: 'guest',
      captiveType: 'SelfSignIn',
      network: {
        id: '6',
        name: 'Network A',
        captiveType: 'Guest Pass'
      },
      venues: { count: 0, names: [] },
      clients: 88
    },
    {
      id: '7',
      name: 'NetB',
      nwSubType: 'guest',
      captiveType: 'SelfSignIn',
      network: {
        id: '3b11bcaffd6f4f4f9b2805b6fe24bf8d',
        name: 'Network B',
        captiveType: 'Guest Pass'
      },
      venues: { count: 0, names: [] },
      clients: 64
    },
    {
      id: '8',
      name: 'NetC',
      nwSubType: 'guest',
      captiveType: 'SelfSignIn',
      network: {
        id: '3b11bcaffd6f4f4f9b2805b6fe24bf8f',
        name: 'Network C',
        captiveType: 'Self Sign In'
      },
      venues: { count: 1, names: [] },
      clients: 86
    },
    {
      id: '4',
      name: 'NetD',
      nwSubType: 'guest',
      captiveType: 'SelfSignIn',
      network: {
        id: '3b11bcaffd6f4f4f9b2805b6fe24bf8g',
        name: 'Network E',
        captiveType: 'Self Sign In'
      },
      venues: { count: 2, names: [] },
      clients: 70
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
  },
  networkIds: [1, 2]
}


describe.skip('Portal Detail Page', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
      serviceId: '373377b0cb6e46ea8982b1c80aabe1fa'
    }
  })

  it('should render detail page', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        PortalUrlsInfo.getPortalProfileDetail.url,
        (_, res, ctx) => res(ctx.json(detailResult))
      ),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ acceptTermsLink: 'terms & conditions',
            acceptTermsMsg: 'I accept the' }))
        })
    )
    render(<Provider><PortalServiceDetail /></Provider>, {
      route: { params, path: '/:tenantId/t/services/portal/:serviceId/detail' }
    })
    expect(await screen.findByText('English')).toBeVisible()
    expect(await screen.findByText((`Instances (${list.data.length})`))).toBeVisible()
    const body = await findTBody()
    await waitFor(() => expect(within(body).getAllByRole('row')).toHaveLength(4))
  })

  it('should render breadcrumb correctly', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        PortalUrlsInfo.getPortalProfileDetail.url,
        (_, res, ctx) => res(ctx.json(detailResult))
      ),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ acceptTermsLink: 'terms & conditions',
            acceptTermsMsg: 'I accept the' }))
        })
    )
    render(<Provider><PortalServiceDetail /></Provider>, {
      route: { params, path: '/:tenantId/t/services/portal/:serviceId/detail' }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Guest Portal'
    })).toBeVisible()
  })

  it('should render detail changed page', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        PortalUrlsInfo.getPortalProfileDetail.url,
        (_, res, ctx) => res(ctx.json(detailChangeResult))
      ),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ acceptTermsLink: 'terms & conditions',
            acceptTermsMsg: 'I accept the' }))
        })
    )
    render(<Provider><PortalServiceDetail /></Provider>, {
      route: { params, path: '/:tenantId/t/services/portal/:serviceId/detail' }
    })
    expect(await screen.findByText('English')).toBeVisible()
    expect(await screen.findByText((`Instances (${list.data.length})`))).toBeVisible()
  })
})
