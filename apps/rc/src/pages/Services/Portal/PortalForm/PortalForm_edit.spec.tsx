import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, defaultComDisplay, Portal }                        from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import Photo                     from '../../../../assets/images/portal-demo/PortalPhoto.svg'
import Powered                   from '../../../../assets/images/portal-demo/PoweredLogo.svg'
import Logo                      from '../../../../assets/images/portal-demo/RuckusCloud.svg'
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
      Czech: false,
      ChineseTraditional: false,
      Finnish: false,
      French: false,
      German: false,
      Greek: false,
      Hungarian: false,
      Italian: false
    }
  }
}

async function fillInBeforeSettings (portalName: string) {
  const insertInput = screen.getByLabelText('Service Name')
  fireEvent.change(insertInput, { target: { value: portalName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating, { timeout: 7000 })
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
        })
    )


    const { asFragment } = render(<Provider><PortalForm /></Provider>, {
      route: { params }
    })

    expect(asFragment()).toMatchSnapshot()
    fillInBeforeSettings('open portal edit test')

    await screen.findByRole('heading', { level: 3, name: 'Settings' })
    await userEvent.click(await screen.findByText('Reset'))
    await userEvent.click(await screen.findByRole('button', { name: 'Finish' }))
  })
})
