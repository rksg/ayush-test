import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { defaultComDisplay
}     from '@acx-ui/rc/utils'
import { Provider }                  from '@acx-ui/store'
import { render, fireEvent, screen } from '@acx-ui/test-utils'

import Photo                     from '../../../../assets/images/portal-demo/PortalPhoto.svg'
import Powered                   from '../../../../assets/images/portal-demo/PoweredLogo.svg'
import Logo                      from '../../../../assets/images/portal-demo/RuckusCloud.svg'
import { PortalDemoDefaultSize } from '../../commonUtils'
import PortalFormContext         from '../PortalForm/PortalFormContext'

import PortalDemo from './index'

const mockDemo = {
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
  componentDisplay: { ...defaultComDisplay, WiFi4EU: true, TermsConditions: true },
  displayLang: 'English',
  alternativeLang: {
    Czech: true,
    ChineseTraditional: false,
    Finnish: true,
    French: true,
    German: true,
    Hungarian: true,
    Italian: false
  }
}

describe('PortalDemo', () => {

  it('should render portal demo successfully', async () => {

    const { asFragment } = render(
      <PortalFormContext.Provider value={{ error: true }}>
        <Form>
          <PortalDemo value={mockDemo} />
        </Form>
      </PortalFormContext.Provider>
    )
    expect(asFragment()).toMatchSnapshot()
    const file = new File(['logo ruckus'],
      'https://storage.cloud.google.com/ruckus-web-1/acx-ui-static-resources/logo-ruckus.png',
      { type: 'image/png' })
    await userEvent.click(await screen.findByTitle('background setting'))
    await userEvent.click(await screen.findByText('Set background color'))
    await userEvent.click(await screen.findByTitle('#D0021B'))

    await userEvent.upload(await screen.findByLabelText('Select image'),file)
    await userEvent.click(await screen.findByText('Select image'))


    fireEvent.mouseLeave(await screen.findByPlaceholderText('welcometext'))

    await userEvent.click(await screen.findByPlaceholderText('welcometext'))
    await userEvent.click(await screen.findByTitle('textplus'))
    await userEvent.click(await screen.findByTitle('textplus'))
    await userEvent.click(await screen.findByTitle('textminus'))

    await userEvent.click(await screen.findByTitle('colorpick'))
    await userEvent.click(await screen.findByTitle('eyehide'))
    await userEvent.type(await screen.findByPlaceholderText('welcometext'),'welcome text')

    fireEvent.mouseOver(await screen.findByPlaceholderText('buttonsetting'))
    fireEvent.mouseLeave(await screen.findByPlaceholderText('buttonsetting'))
    fireEvent.click(await screen.findByPlaceholderText('buttonsetting'))
    await userEvent.click((await screen.findAllByTitle('colorpick'))[1])
    await userEvent.click(await screen.findByTitle('#F5A623'))

    await userEvent.click((await screen.findAllByTitle('Click Through'))[0])
    await userEvent.click((await screen.findAllByTitle('Guest Pass - Connect'))[0])
    await userEvent.click(await screen.findByPlaceholderText('buttonsetting'))
    await userEvent.click((await screen.findAllByTitle('colorpick'))[1])
    await userEvent.click(await screen.findByTitle('#F5A623'))
    await userEvent.click((await screen.findAllByTitle('Guest Pass - Connect'))[0])

    await userEvent.click((await screen.findAllByTitle('Guest Pass - Forgot password'))[0])
    await userEvent.click(await screen.findByPlaceholderText('buttonsetting'))
    await userEvent.click((await screen.findAllByTitle('colorpick'))[1])

    await userEvent.click(await screen.findByTitle('#F5A623'))
    await userEvent.click(await screen.findByText('Email Message'))
    await userEvent.click((await screen.findAllByPlaceholderText('buttonsetting'))[1])

    await userEvent.click((await screen.findAllByTitle('colorpick'))[2])
    await userEvent.click(await screen.findByTitle('#F5A623'))
    await userEvent.click((await screen.findAllByTitle('Guest Pass - Forgot password'))[0])

    await userEvent.click((await screen.findAllByTitle('Self Sign In - Connect'))[0])
    await userEvent.click((await screen.findAllByTitle('Self Sign In - Connect'))[0])
    await userEvent.click((await screen.findAllByTitle('Self Sign In - Register/Confirm'))[0])
    await userEvent.click(await screen.findByPlaceholderText('buttonsetting'))
    await userEvent.click((await screen.findAllByTitle('colorpick'))[1])
    await userEvent.click(await screen.findByTitle('#F5A623'))
    await userEvent.click(await screen.findByText('Login'))
    await userEvent.click((await screen.findAllByPlaceholderText('buttonsetting'))[1])
    await userEvent.click((await screen.findAllByTitle('colorpick'))[2])
    await userEvent.click(await screen.findByTitle('#F5A623'))
    await userEvent.click((await screen.findAllByTitle('Self Sign In - Register/Confirm'))[0])
    await userEvent.click((await screen.findAllByTitle('Host Approval - Register/Confirm'))[0])
    await userEvent.click(await screen.findByPlaceholderText('buttonsetting'))
    await userEvent.click((await screen.findAllByTitle('colorpick'))[1])
    await userEvent.click(await screen.findByTitle('#F5A623'))
    await userEvent.click(await screen.findByText('Login'))
    await userEvent.click((await screen.findAllByPlaceholderText('buttonsetting'))[1])
    await userEvent.click((await screen.findAllByTitle('colorpick'))[2])
    await userEvent.click(await screen.findByTitle('#F5A623'))
    await userEvent.click((await screen.findAllByTitle('Host Approval - Register/Confirm'))[0])

    await userEvent.click((await screen.findAllByTitle('Connection confirmed'))[0])
    await userEvent.click((await screen.findAllByTitle('Connection confirmed'))[0])
    await userEvent.click((await screen.findAllByTitle('Terms & Conditions'))[0])
    await userEvent.click(await screen.findByPlaceholderText('buttonsetting'))
    await userEvent.click((await screen.findAllByTitle('colorpick'))[1])
    await userEvent.click(await screen.findByTitle('#F5A623'))

    await userEvent.click(await screen.findByText('Language Settings'))
    await userEvent.click((await screen.findAllByTitle('English'))[1])
    await userEvent.click((await screen.findAllByTitle('Czech (čeština)'))[0])
    await userEvent.click((await screen.findAllByRole('combobox'))[2])
    await userEvent.click((await screen.findAllByText('Finnish (suomi)'))[0])

    await userEvent.click(await screen.findByText('Components'))
    const rows = await screen.findAllByRole('switch')
    const toogleButton = rows[2]
    fireEvent.click(toogleButton)
    fireEvent.click(toogleButton)
    const setRows = await screen.findAllByTitle('settingicon')
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

    await userEvent.upload(await screen.findByPlaceholderText('contentimageupload'), file)
    await userEvent.click(await screen.findByTitle('pictureout'))
    await userEvent.click(await screen.findByRole('img',{ name: 'Logo' }))
    fireEvent.mouseLeave(await screen.findByRole('img',{ name: 'Logo' }))
    await userEvent.click(await screen.findByRole('img',{ name: 'Photo png' }))
    await userEvent.click((await screen.findAllByTitle('plusen'))[1])
    await userEvent.click(await screen.findByRole('img',{ name: 'Photo png' }))
    fireEvent.mouseLeave(await screen.findByRole('img',{ name: 'Photo png' }))

    await userEvent.click(await screen.findByPlaceholderText('sectexthere'))
    await userEvent.click((await screen.findAllByTitle('textplus'))[1])
    await userEvent.click(await screen.findByPlaceholderText('sectexthere'))
    fireEvent.mouseLeave(await screen.findByPlaceholderText('sectexthere'))

    await userEvent.click(await screen.findByPlaceholderText('poweredtext'))
    await userEvent.click((await screen.findAllByTitle('textplus'))[2])
    await userEvent.click(await screen.findByPlaceholderText('poweredtext'))
    fireEvent.mouseLeave(await screen.findByPlaceholderText('poweredtext'))

    await userEvent.click(await screen.findByRole('img',{ name: 'poweredimage' }))
    await userEvent.click((await screen.findAllByTitle('plusen'))[2])
    await userEvent.click(await screen.findByRole('img',{ name: 'poweredimage' }))
    fireEvent.mouseLeave(await screen.findByRole('img',{ name: 'poweredimage' }))

    await userEvent.click(await screen.findByPlaceholderText('poweredbackground'))
    await userEvent.click((await screen.findAllByTitle('eyehide'))[4])
    await userEvent.click(await screen.findByPlaceholderText('poweredbackground'))
    fireEvent.mouseLeave(await screen.findByPlaceholderText('poweredbackground'))

    fireEvent.click(await screen.findByText('Reset'))
  })

  it('should render portal demo preview successfully', async () => {
    const { asFragment } = render(
      <Provider>
        <Form>
          <PortalDemo value={mockDemo} isPreview={true}/>
        </Form>
      </Provider>
    )
    expect(asFragment()).toMatchSnapshot()
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
  })
})
