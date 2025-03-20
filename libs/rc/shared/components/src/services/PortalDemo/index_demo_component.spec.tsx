/* eslint-disable max-len */
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { baseUrlFor }                         from '@acx-ui/config'
import { defaultComDisplay, PortalUrlsInfo
}     from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { render, fireEvent, screen, mockServer } from '@acx-ui/test-utils'

import { PortalDemoDefaultSize } from './commonUtils'
import PortalViewText            from './PortalViewText'

import { PortalDemo } from './index'

const Photo = baseUrlFor('/assets/images/portal/PortalPhoto.jpg')
const Powered = baseUrlFor('/assets/images/portal/PoweredLogo.png')
const Logo = baseUrlFor('/assets/images/portal/RuckusCloud.png')

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
const file = new File(['logo ruckus'],
  'https://storage.cloud.google.com/ruckus-web-1/acx-ui-static-resources/logo-ruckus.png',
  { type: 'image/png' })
describe('PortalDemo', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (req, res, ctx) => {
          return res(ctx.json({ acceptTermsLink: 'terms & conditions',
            acceptTermsMsg: 'I accept the',
            acceptTermsMsg2: 'By clicking the connect button, you are accepting the <1>{{linkText}}</1>',
            acceptTermsMsgClickthrough: 'By clicking the connect button, you are accepting the <1>{{linkText}}</1>',
            acceptTermsMsgSelfSign: 'By registering, you are accepting the <1>{{linkText}}</1>',
            acceptTermsMsgHostApproval: 'By registering, you are accepting the <1>{{linkText}}</1>'
          }))
        })
    )
  })
  it('should render portal demo successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <PortalDemo value={mockDemo} />
        </Form>
      </Provider>, { route: { params } }
    )
    await userEvent.click((await screen.findAllByTitle('English'))[0])
    await userEvent.click((await screen.findAllByTitle('Czech (čeština)'))[0])
    await userEvent.click(await screen.findByText('Components'))
    const rows = await screen.findAllByRole('switch')
    const toogleButton = rows[2]
    fireEvent.click(toogleButton)
    fireEvent.click(toogleButton)
    const setRows = await screen.findAllByTestId('settingicon')
    fireEvent.click(setRows[0])
    await userEvent.type(await screen.findByPlaceholderText('Paste the text here...'),'terms terms')
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    fireEvent.click(setRows[0])
    await userEvent.type(await screen.findByPlaceholderText('Paste the text here...'),'terms terms')
    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
    fireEvent.click(setRows[1])
    await userEvent.type(await screen.findByPlaceholderText(
      'Copy from your WiFi4EU installation report'),'UUID')
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    fireEvent.click(setRows[1])
    await userEvent.type(await screen.findByPlaceholderText(
      'Copy from your WiFi4EU installation report'),'UUID')
    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))

    await userEvent.click(await screen.findByTitle('deskicon'))
    await userEvent.click(await screen.findByTitle('tableticon'))
    await userEvent.click(await screen.findByTitle('mobileicon'))
    await userEvent.click(await screen.findByRole('img',{ name: 'Logo' }))
    await userEvent.click(await screen.findByTitle('plusen'))
    await userEvent.click(await screen.findByTitle('plusen'))
    await userEvent.click(await screen.findByTitle('minusen'))

    await userEvent.upload((await screen.findAllByPlaceholderText('contentimageupload'))[0], file)
    await userEvent.click((await screen.findAllByTitle('pictureout'))[0])
    fireEvent.mouseLeave(await screen.findByRole('img',{ name: 'Logo' }))
    await userEvent.click(await screen.findByRole('img',{ name: 'Logo' }))
    fireEvent.mouseLeave(await screen.findByRole('img',{ name: 'Logo' }))
    await userEvent.click(await screen.findByRole('img',{ name: 'Photo png' }))
    await userEvent.click((await screen.findAllByTitle('plusen'))[1])
    await userEvent.upload((await screen.findAllByPlaceholderText('contentimageupload'))[1], file)
    await userEvent.click((await screen.findAllByTitle('pictureout'))[1])
    fireEvent.mouseLeave(await screen.findByRole('img',{ name: 'Photo png' }))
    await userEvent.click(await screen.findByRole('img',{ name: 'Photo png' }))
    fireEvent.mouseLeave(await screen.findByRole('img',{ name: 'Photo png' }))

    await updateContent()

  })

  it('should render PortalViewText correct', async () => {
    const text = 'test text'
    render(
      <PortalViewText value={text} id='test'/>
    )
    expect(await screen.findByText(text)).toBeVisible()
  })
})
async function updateContent () {
  await userEvent.click(await screen.findByPlaceholderText('sectexthere'))
  await userEvent.click((await screen.findAllByTitle('textplus'))[0])
  fireEvent.mouseLeave(await screen.findByPlaceholderText('sectexthere'))
  await userEvent.type(await screen.findByPlaceholderText('sectexthere'),'sec text')
  fireEvent.mouseLeave(await screen.findByPlaceholderText('sectexthere'))

  await userEvent.click(await screen.findByPlaceholderText('poweredtext'))
  await userEvent.click((await screen.findAllByTitle('textplus'))[1])
  fireEvent.mouseLeave(await screen.findByPlaceholderText('poweredtext'))
  await userEvent.click(await screen.findByPlaceholderText('poweredtext'))
  fireEvent.mouseLeave(await screen.findByPlaceholderText('poweredtext'))

  await userEvent.click(await screen.findByRole('img',{ name: 'poweredimage' }))
  await userEvent.click((await screen.findAllByTitle('plusen'))[2])
  await userEvent.upload((await screen.findAllByPlaceholderText('contentimageupload'))[2], file)
  await userEvent.click((await screen.findAllByTitle('pictureout'))[2])
  fireEvent.mouseLeave(await screen.findByRole('img',{ name: 'poweredimage' }))
  await userEvent.click(await screen.findByRole('img',{ name: 'poweredimage' }))
  fireEvent.mouseLeave(await screen.findByRole('img',{ name: 'poweredimage' }))

  await userEvent.click(await screen.findByPlaceholderText('poweredbackground'))
  await userEvent.click((await screen.findAllByTitle('eyehide'))[3])
  fireEvent.mouseLeave(await screen.findByPlaceholderText('poweredbackground'))
  await userEvent.click(await screen.findByPlaceholderText('poweredbackground'))
  fireEvent.mouseLeave(await screen.findByPlaceholderText('poweredbackground'))
}
