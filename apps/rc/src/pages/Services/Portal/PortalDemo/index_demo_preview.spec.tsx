import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { defaultComDisplay, PortalUrlsInfo
}     from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { render, fireEvent, screen, mockServer } from '@acx-ui/test-utils'

import Photo                     from '../../../../assets/images/portal-demo/PortalPhoto.svg'
import Powered                   from '../../../../assets/images/portal-demo/PoweredLogo.svg'
import Logo                      from '../../../../assets/images/portal-demo/RuckusCloud.svg'
import { PortalDemoDefaultSize } from '../../commonUtils'

import PortalDemo from './index'

const mockDemo = {
  bgColor: 'var(--acx-primary-white)',
  bgImage: '',
  welcomeText: 'Welcome to the Guest Access login page',
  welcomeColor: 'var(--acx-primary-black)',
  welcomeSize: PortalDemoDefaultSize.welcomeSize,
  photo: Photo,
  photoRatio: PortalDemoDefaultSize.photoRatio,
  logo: Logo,
  logoRatio: PortalDemoDefaultSize.logoRatio,
  secondaryText: 'Lorem ipsum dolor sit amet, '+
  'consectetur adipiscing elit. Aenean euismod bibendum laoreet.',
  secondaryColor: 'var(--acx-primary-black)',
  secondarySize: PortalDemoDefaultSize.secondarySize,
  buttonColor: 'var(--acx-accents-orange-50)',
  poweredBgColor: 'var(--acx-primary-white)',
  poweredColor: 'var(--acx-primary-black)',
  poweredSize: PortalDemoDefaultSize.poweredSize,
  poweredImg: Powered,
  poweredImgRatio: PortalDemoDefaultSize.poweredImgRatio,
  wifi4EUNetworkId: '',
  termsCondition: '',
  componentDisplay: { ...defaultComDisplay, wifi4eu: true, termsConditions: true },
  displayLangCode: 'en',
  alternativeLang: {
    cs: true,
    zh_TW: false,
    fi: true,
    fr: true,
    de: true,
    hu: true,
    it: false
  }
}

describe('PortalDemo', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (req, res, ctx) => {
          return res(ctx.json({ acceptTermsLink: 'terms & conditions',
            acceptTermsMsg: 'I accept the' }))
        })
    )
  })
  it('should render portal demo preview successfully', async () => {
    await demoPreview()
  })
})
async function demoPreview () {
  render(
    <Provider>
      <Form>
        <PortalDemo value={mockDemo}
          isPreview={true}
          networkSocial={{ smsEnabled: true, facebookEnabled: true,
            googleEnabled: true, twitterEnabled: true, linkedInEnabled: true }} />
      </Form>
    </Provider>
  )
  await changeView()
}
async function changeView () {
  await userEvent.click((await screen.findAllByTitle('Click Through'))[0])
  await userEvent.click((await screen.findAllByTitle('Guest Pass - Connect'))[0])
  await userEvent.click((await screen.findAllByTitle('Guest Pass - Connect'))[0])
  await userEvent.click((await screen.findAllByTitle('Guest Pass - Forgot password'))[0])
  await userEvent.click((await screen.findAllByTitle('Guest Pass - Forgot password'))[0])
  await userEvent.click((await screen.findAllByTitle('Self Sign In - Connect'))[0])
  await userEvent.click((await screen.findAllByTitle('Self Sign In - Connect'))[0])
  await userEvent.click((await screen.findAllByTitle('Self Sign In - Register/Confirm'))[0])
  await userEvent.click((await screen.findAllByTitle('Self Sign In - Register/Confirm'))[0])
  await userEvent.click((await screen.findAllByTitle('Host Approval - Register/Confirm'))[0])
  await userEvent.click((await screen.findAllByTitle('Host Approval - Register/Confirm'))[0])
  await userEvent.click((await screen.findAllByTitle('Connection confirmed'))[0])
  await userEvent.click((await screen.findAllByTitle('Connection confirmed'))[0])
  fireEvent.click((await screen.findAllByTitle('Terms & Conditions'))[0])
}
