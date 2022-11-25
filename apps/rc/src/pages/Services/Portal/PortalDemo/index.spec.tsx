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
    await userEvent.click(screen.getByTitle('background setting'))
    await userEvent.click(screen.getByText('Set background color'))
    await userEvent.click(screen.getByTitle('#D0021B'))

    await userEvent.upload(screen.getByLabelText('Select image'),file)
    await userEvent.click(screen.getByText('Select image'))


    fireEvent.mouseLeave(screen.getByPlaceholderText('welcometext'))

    await userEvent.click(screen.getByPlaceholderText('welcometext'))
    await userEvent.click(screen.getByTitle('textplus'))
    await userEvent.click(screen.getByTitle('textplus'))
    await userEvent.click(screen.getByTitle('textminus'))

    await userEvent.click(screen.getByTitle('colorpick'))
    await userEvent.click(screen.getByTitle('eyehide'))
    await userEvent.type(screen.getByPlaceholderText('welcometext'),'welcome text')

    fireEvent.mouseOver(screen.getByPlaceholderText('buttonsetting'))
    fireEvent.mouseLeave(screen.getByPlaceholderText('buttonsetting'))
    fireEvent.click(screen.getByPlaceholderText('buttonsetting'))
    await userEvent.click(screen.getAllByTitle('colorpick')[1])
    await userEvent.click(screen.getByTitle('#F5A623'))

    await userEvent.click(screen.getAllByTitle('Click Through')[0])
    await userEvent.click(screen.getAllByTitle('Guest Pass - Connect')[0])
    await userEvent.click(screen.getByPlaceholderText('buttonsetting'))
    await userEvent.click(screen.getAllByTitle('colorpick')[1])
    await userEvent.click(screen.getByTitle('#F5A623'))
    await userEvent.click(screen.getAllByTitle('Guest Pass - Connect')[0])

    await userEvent.click(screen.getAllByTitle('Guest Pass - Forgot password')[0])
    await userEvent.click(screen.getByPlaceholderText('buttonsetting'))
    await userEvent.click(screen.getAllByTitle('colorpick')[1])

    await userEvent.click(screen.getByTitle('#F5A623'))
    await userEvent.click(screen.getByText('Email Message'))
    await userEvent.click(screen.getAllByPlaceholderText('buttonsetting')[1])

    await userEvent.click(screen.getAllByTitle('colorpick')[2])
    await userEvent.click(screen.getByTitle('#F5A623'))
    await userEvent.click(screen.getAllByTitle('Guest Pass - Forgot password')[0])

    await userEvent.click(screen.getAllByTitle('Self Sign In - Connect')[0])
    await userEvent.click(screen.getAllByTitle('Self Sign In - Connect')[0])
    await userEvent.click(screen.getAllByTitle('Self Sign In - Register/Confirm')[0])
    await userEvent.click(screen.getByPlaceholderText('buttonsetting'))
    await userEvent.click(screen.getAllByTitle('colorpick')[1])
    await userEvent.click(screen.getByTitle('#F5A623'))
    await userEvent.click(screen.getByText('Login'))
    await userEvent.click(screen.getAllByPlaceholderText('buttonsetting')[1])
    await userEvent.click(screen.getAllByTitle('colorpick')[2])
    await userEvent.click(screen.getByTitle('#F5A623'))
    await userEvent.click(screen.getAllByTitle('Self Sign In - Register/Confirm')[0])
    await userEvent.click(screen.getAllByTitle('Host Approval - Register/Confirm')[0])
    await userEvent.click(screen.getByPlaceholderText('buttonsetting'))
    await userEvent.click(screen.getAllByTitle('colorpick')[1])
    await userEvent.click(screen.getByTitle('#F5A623'))
    await userEvent.click(screen.getByText('Login'))
    await userEvent.click(screen.getAllByPlaceholderText('buttonsetting')[1])
    await userEvent.click(screen.getAllByTitle('colorpick')[2])
    await userEvent.click(screen.getByTitle('#F5A623'))
    await userEvent.click(screen.getAllByTitle('Host Approval - Register/Confirm')[0])

    await userEvent.click(screen.getAllByTitle('Connection confirmed')[0])
    await userEvent.click(screen.getAllByTitle('Connection confirmed')[0])
    await userEvent.click(screen.getAllByTitle('Terms & Conditions')[0])
    await userEvent.click(screen.getByPlaceholderText('buttonsetting'))
    await userEvent.click(screen.getAllByTitle('colorpick')[1])
    await userEvent.click(screen.getByTitle('#F5A623'))

    await userEvent.click(screen.getByText('Language Settings'))
    await userEvent.click(screen.getAllByTitle('English')[1])
    await userEvent.click(screen.getAllByTitle('Czech (čeština)')[0])
    await userEvent.click(screen.getAllByRole('combobox')[2])
    await userEvent.click(screen.getAllByText('Finnish (suomi)')[0])

    await userEvent.click(screen.getByText('Components'))
    const rows = await screen.findAllByRole('switch')
    const toogleButton = rows[2]
    fireEvent.click(toogleButton)
    fireEvent.click(toogleButton)
    const setRows = screen.getAllByTitle('settingicon')
    fireEvent.click(setRows[0])
    await userEvent.type(screen.getByPlaceholderText('Paste the text here...'),'terms terms')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    fireEvent.click(setRows[0])
    await userEvent.type(screen.getByPlaceholderText('Paste the text here...'),'terms terms')
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    fireEvent.click(setRows[1])
    await userEvent.type(screen.getByPlaceholderText(
      'Copy from your WiFi4EU installation report'),'UUID')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    fireEvent.click(setRows[1])
    await userEvent.type(screen.getByPlaceholderText(
      'Copy from your WiFi4EU installation report'),'UUID')
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))

    await userEvent.click(screen.getByTitle('deskicon'))
    await userEvent.click(screen.getByTitle('tableticon'))
    await userEvent.click(screen.getByTitle('mobileicon'))
    await userEvent.click(screen.getByRole('img',{ name: 'Logo' }))
    await userEvent.click(screen.getByTitle('plusen'))
    await userEvent.click(screen.getByTitle('plusen'))
    await userEvent.click(screen.getByTitle('minusen'))

    await userEvent.upload(screen.getByPlaceholderText('contentimageupload'), file)
    await userEvent.click(screen.getByTitle('pictureout'))
    await userEvent.click(screen.getByRole('img',{ name: 'Logo' }))
    fireEvent.mouseLeave(screen.getByRole('img',{ name: 'Logo' }))
    await userEvent.click(screen.getByRole('img',{ name: 'Photo png' }))
    await userEvent.click(screen.getAllByTitle('plusen')[1])
    await userEvent.click(screen.getByRole('img',{ name: 'Photo png' }))
    fireEvent.mouseLeave(screen.getByRole('img',{ name: 'Photo png' }))

    await userEvent.click(screen.getByPlaceholderText('sectexthere'))
    await userEvent.click(screen.getAllByTitle('textplus')[1])
    await userEvent.click(screen.getByPlaceholderText('sectexthere'))
    fireEvent.mouseLeave(screen.getByPlaceholderText('sectexthere'))

    await userEvent.click(screen.getByPlaceholderText('poweredtext'))
    await userEvent.click(screen.getAllByTitle('textplus')[2])
    await userEvent.click(screen.getByPlaceholderText('poweredtext'))
    fireEvent.mouseLeave(screen.getByPlaceholderText('poweredtext'))

    await userEvent.click(screen.getByRole('img',{ name: 'poweredimage' }))
    await userEvent.click(screen.getAllByTitle('plusen')[2])
    await userEvent.click(screen.getByRole('img',{ name: 'poweredimage' }))
    fireEvent.mouseLeave(screen.getByRole('img',{ name: 'poweredimage' }))

    await userEvent.click(screen.getByPlaceholderText('poweredbackground'))
    await userEvent.click(screen.getAllByTitle('eyehide')[4])
    await userEvent.click(screen.getByPlaceholderText('poweredbackground'))
    fireEvent.mouseLeave(screen.getByPlaceholderText('poweredbackground'))

    fireEvent.click(screen.getByText('Reset'))
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
    await userEvent.click(screen.getAllByTitle('Click Through')[0])
    await userEvent.click(screen.getAllByTitle('Guest Pass - Connect')[0])
    await userEvent.click(screen.getAllByTitle('Guest Pass - Connect')[0])
    await userEvent.click(screen.getAllByTitle('Guest Pass - Forgot password')[0])
    await userEvent.click(screen.getAllByTitle('Guest Pass - Forgot password')[0])
    await userEvent.click(screen.getAllByTitle('Self Sign In - Connect')[0])
    await userEvent.click(screen.getAllByTitle('Self Sign In - Connect')[0])
    await userEvent.click(screen.getAllByTitle('Self Sign In - Register/Confirm')[0])
    await userEvent.click(screen.getAllByTitle('Self Sign In - Register/Confirm')[0])
    await userEvent.click(screen.getAllByTitle('Host Approval - Register/Confirm')[0])
    await userEvent.click(screen.getAllByTitle('Host Approval - Register/Confirm')[0])
    await userEvent.click(screen.getAllByTitle('Connection confirmed')[0])
    await userEvent.click(screen.getAllByTitle('Connection confirmed')[0])
    fireEvent.click(screen.getAllByTitle('Terms & Conditions')[0])
  })
})
