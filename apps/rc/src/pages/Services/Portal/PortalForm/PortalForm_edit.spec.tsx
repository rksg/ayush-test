import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, defaultComDisplay, Portal }                        from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import Photo                     from '../../../../assets/images/portal-demo/main-photo.svg'
import Powered                   from '../../../../assets/images/portal-demo/powered-logo-img.svg'
import Logo                      from '../../../../assets/images/portal-demo/small-logo-img.svg'
import { PortalDemoDefaultSize } from '../../commonUtils'

import { PortalForm } from './PortalForm'

const portalResponse: Portal = {
  id: '1',
  serviceName: 'test111',
  network: [],
  demo: {
    backgroundColor: 'var(--acx-primary-white)',
    backgroundImage: '',
    welcomeText: 'Welcome to the Guest Access login page',
    welcomeColor: 'var(--acx-primary-black)',
    welcomeSize: PortalDemoDefaultSize.welcomeSize,
    photo: Photo,
    photoSize: PortalDemoDefaultSize.photoSize,
    logo: Logo,
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

export const networkResponse = {
  fields: [
    'name',
    'id',
    'captiveType',
    'venues',
    'activated',
    'nwSubType'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      name: '!!!New_Evolink!!!',
      id: 'efef32751d854e2ea2bfce4b367c330c',
      nwSubType: 'guest',
      captiveType: 'SelfSignIn',
      venues: {
        count: 2,
        names: [
          'Sindhuja-Venue',
          'Govind'
        ]
      }
    },
    {
      name: '!!!SANWPA2!!!',
      id: '1d88235da9504a98847fb5ed2b971052',
      nwSubType: 'psk',
      venues: {
        count: 1,
        names: [
          'Sandeep-R550'
        ]
      }
    }
  ]
}


async function fillInBeforeSettings (portalName: string) {
  const insertInput = screen.getByLabelText('Service Name')
  fireEvent.change(insertInput, { target: { value: portalName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating, { timeout: 7000 })

  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
}

describe('PortalForm', () => {


  it('should edit open Portal successfully', async () => {

    const params = { networkId: '5d45082c812c45fbb9aab24420f39bf0',
      tenantId: 'tenant-id', action: 'edit', serviceId: '5d45082c812c45fbb9aab24420f39bf1' }

    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.get(CommonUrlsInfo.getService.url,
        (_, res, ctx) => {
          return res(ctx.json(portalResponse))
        }),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networkResponse)))
    )


    const { asFragment } = render(<Provider><PortalForm /></Provider>, {
      route: { params }
    })

    expect(asFragment()).toMatchSnapshot()
    fillInBeforeSettings('open portal edit test')

    await screen.findByRole('heading', { level: 3, name: 'Settings' })
    await userEvent.click(screen.getByText('Reset'))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    //Networks
    await screen.findByRole('heading', { level: 3, name: 'Networks' })
    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))

  })
})
