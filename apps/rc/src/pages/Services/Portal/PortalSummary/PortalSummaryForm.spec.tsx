import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import {
  CommonUrlsInfo,
  defaultComDisplay,
  GuestNetworkTypeEnum
}     from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import Photo                     from '../../../../assets/images/portal-demo/main-photo.svg'
import Powered                   from '../../../../assets/images/portal-demo/powered-logo-img.svg'
import Logopng                   from '../../../../assets/images/portal-demo/small-logo-img.png'
import { PortalDemoDefaultSize } from '../../commonUtils'

import { PortalSummaryForm } from './PortalSummaryForm'

const list = {
  totalCount: 2,
  page: 1,
  data: [
    {
      description: '',
      activated: { isActivated: true },
      clients: 6,
      vlan: 2,
      ssid: '',
      aps: 3,
      name: '!!!New_Evolink!!!',
      id: 'efef32751d854e2ea2bfce4b367c330c',
      nwSubType: 'guest',
      captiveType: GuestNetworkTypeEnum.SelfSignIn,
      venues: {
        count: 2,
        names: [
          'Sindhuja-Venue',
          'Govind'
        ]
      }
    },
    {
      description: '',
      activated: { isActivated: true },
      clients: 5,
      vlan: 1,
      ssid: '',
      aps: 2,
      name: '!!!SANWPA2!!!',
      id: '1d88235da9504a98847fb5ed2b971052',
      nwSubType: 'guest',
      captiveType: GuestNetworkTypeEnum.SelfSignIn,
      venues: {
        count: 1,
        names: [
          'Sandeep-R550'
        ]
      }
    }
  ]
}

const mockSummary = {
  serviceName: '',
  network: list.data,
  demo: {
    welcomeText: 'Welcome to the Guest Access login page',
    welcomeColor: 'var(--acx-primary-black)',
    welcomeSize: PortalDemoDefaultSize.welcomeSize,
    photo: Photo,
    photoSize: PortalDemoDefaultSize.photoSize,
    logo: Logopng,
    logoSize: PortalDemoDefaultSize.logoSize,
    secondaryText: 'Lorem ipsum dolor sit amet, '+
    'consectetur adipiscing elit. Aenean euismod bibendum laoreet.',
    secondaryColor: 'var(--acx-primary-black)',
    secondarySize: PortalDemoDefaultSize.secondarySize,
    buttonColor: 'var(--acx-accents-orange-50)',
    poweredBackgroundColor: 'var(--acx-primary-white)',
    poweredColor: 'var(--acx-primary-black)',
    poweredSize: PortalDemoDefaultSize.poweredSize,
    poweredImg: Powered,
    poweredImgSize: PortalDemoDefaultSize.poweredImgSize,
    wifi4EU: '',
    termsCondition: '',
    componentDisplay: defaultComDisplay ,
    displayLang: 'English',
    alternativeLang: {
      Czech: true,
      ChineseTraditional: false,
      Finnish: true,
      French: true,
      German: true,
      Greek: true,
      Hungarian: true,
      Italian: false
    }
  }
}

describe('SummaryForm', () => {

  it('should render portal summary successfully', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const { asFragment } = render(
      <Provider>
        <Form>
          <PortalSummaryForm summaryData={mockSummary} />
        </Form>
      </Provider>,
      {
        route: { params,path: '/:tenantId/:networkId' }
      }
    )

    expect(asFragment()).toMatchSnapshot()
    await userEvent.click(screen.getByText('Preview'))
    await userEvent.click(screen.getByRole('img',{ name: 'close' }))
  })
})
