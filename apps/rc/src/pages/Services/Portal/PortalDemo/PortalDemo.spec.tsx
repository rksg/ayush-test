import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { defaultComDisplay
}     from '@acx-ui/rc/utils'
import { Provider }                  from '@acx-ui/store'
import { render, fireEvent, screen } from '@acx-ui/test-utils'

import Photo                     from '../../../../assets/images/portal-demo/main-photo.svg'
import Powered                   from '../../../../assets/images/portal-demo/powered-logo-img.svg'
import Logopng                   from '../../../../assets/images/portal-demo/small-logo-img.png'
import { PortalDemoDefaultSize } from '../../commonUtils'
import PortalFormContext         from '../PortalForm/PortalFormContext'

import PortalDemo from './PortalDemo'



const mockDemo = {
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
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const { asFragment } = render(
      <PortalFormContext.Provider value={{ error: true }}>
        <Form>
          <PortalDemo value={mockDemo} />
        </Form>
      </PortalFormContext.Provider>,
      {
        route: { params }
      }
    )
    expect(asFragment()).toMatchSnapshot()
    await userEvent.click(screen.getByRole('img',{ name: 'background setting' }))
    await userEvent.click(screen.getByText('Set background color'))
    await userEvent.click(screen.getByTitle('#D0021B'))

    await userEvent.click(screen.getByText('Select image'))


    fireEvent.mouseLeave(screen.getByPlaceholderText('welcometext'))
    await userEvent.click(screen.getByPlaceholderText('welcometext'))
    await userEvent.click(screen.getByRole('img',{ name: 'textplus' }))
    await userEvent.click(screen.getByRole('img',{ name: 'textplus' }))
    await userEvent.click(screen.getByRole('img',{ name: 'textminus' }))
    await userEvent.click(screen.getByRole('img',{ name: 'textminus' }))
    await userEvent.click(screen.getByRole('img',{ name: 'colorpick' }))
    await userEvent.click(screen.getByRole('img',{ name: 'eyehide' }))

    fireEvent.mouseOver(screen.getByPlaceholderText('buttonsetting'))
    fireEvent.mouseLeave(screen.getByPlaceholderText('buttonsetting'))
    fireEvent.click(screen.getByPlaceholderText('buttonsetting'))
    await userEvent.click(screen.getByRole('img',{ name: 'colorpick' }))
    await userEvent.click(screen.getByTitle('#F5A623'))
    fireEvent.mouseLeave(screen.getByPlaceholderText('colorpickcontainer'))

    await userEvent.click(screen.getAllByText('Click Through')[0])
    await userEvent.click(screen.getAllByText('Guest Pass - Connect')[1])
    await userEvent.click(screen.getByPlaceholderText('buttonsetting'))
    await userEvent.click(screen.getByRole('img',{ name: 'colorpick' }))
    await userEvent.click(screen.getByTitle('#F5A623'))
    await userEvent.click(screen.getAllByText('Guest Pass - Connect')[0])
    await userEvent.click(screen.getAllByText('Guest Pass - Forgot password')[1])
    await userEvent.click(screen.getByPlaceholderText('buttonsetting'))
    await userEvent.click(screen.getByRole('img',{ name: 'colorpick' }))
    await userEvent.click(screen.getByTitle('#F5A623'))
    await userEvent.click(screen.getByText('Email Message'))
    await userEvent.click(screen.getAllByPlaceholderText('buttonsetting')[1])
    await userEvent.click(screen.getAllByRole('img',{ name: 'colorpick' })[1])
    await userEvent.click(screen.getAllByTitle('#F5A623')[1])

    await userEvent.click(screen.getAllByText('Guest Pass - Forgot password')[0])
    await userEvent.click(screen.getAllByText('Self Sign In - Connect')[1])
    await userEvent.click(screen.getAllByText('Self Sign In - Connect')[1])
    await userEvent.click(screen.getAllByText('Self Sign In - Register/Confirm')[1])
    await userEvent.click(screen.getByPlaceholderText('buttonsetting'))
    await userEvent.click(screen.getByRole('img',{ name: 'colorpick' }))
    await userEvent.click(screen.getByTitle('#F5A623'))
    await userEvent.click(screen.getByText('Login'))
    await userEvent.click(screen.getAllByPlaceholderText('buttonsetting')[1])
    await userEvent.click(screen.getAllByRole('img',{ name: 'colorpick' })[1])
    await userEvent.click(screen.getAllByTitle('#F5A623')[1])

    await userEvent.click(screen.getAllByText('Self Sign In - Register/Confirm')[0])
    await userEvent.click(screen.getAllByText('Host Approval - Register/Confirm')[1])
    await userEvent.click(screen.getByPlaceholderText('buttonsetting'))
    await userEvent.click(screen.getByRole('img',{ name: 'colorpick' }))
    await userEvent.click(screen.getByTitle('#F5A623'))
    await userEvent.click(screen.getByText('Login'))
    await userEvent.click(screen.getAllByPlaceholderText('buttonsetting')[1])
    await userEvent.click(screen.getAllByRole('img',{ name: 'colorpick' })[1])
    await userEvent.click(screen.getAllByTitle('#F5A623')[1])

    await userEvent.click(screen.getAllByText('Host Approval - Register/Confirm')[0])
    await userEvent.click(screen.getAllByText('Connection confirmed')[1])
    await userEvent.click(screen.getAllByText('Connection confirmed')[1])
    await userEvent.click(screen.getAllByText('Terms & Conditions')[1])

    await userEvent.click(screen.getByText('Language Settings'))
    await userEvent.click(screen.getByText('Greek'))

    await userEvent.click(screen.getAllByRole('combobox')[1])
    await userEvent.click(screen.getAllByText('Finnish')[1])

    await userEvent.click(screen.getByText('Components'))
    const rows = await screen.findAllByRole('switch')
    const toogleButton = rows[2]
    fireEvent.click(toogleButton)
    fireEvent.click(toogleButton)
    const setRows = screen.getAllByRole('img',{ name: 'setting' })
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

    await userEvent.click(screen.getByRole('img',{ name: 'deskicon' }))
    await userEvent.click(screen.getByRole('img',{ name: 'tableticon' }))
    await userEvent.click(screen.getByRole('img',{ name: 'mobileicon' }))
    await userEvent.click(screen.getByRole('img',{ name: 'Logo' }))
    await userEvent.click(screen.getByRole('img',{ name: 'plusen' }))
    await userEvent.click(screen.getByRole('img',{ name: 'plusen' }))
    await userEvent.click(screen.getByRole('img',{ name: 'minusen' }))
    await userEvent.click(screen.getByRole('img',{ name: 'minusen' }))
    await userEvent.click(screen.getByRole('img',{ name: 'Logo' }))
    fireEvent.mouseLeave(screen.getByRole('img',{ name: 'Logo' }))
    await userEvent.click(screen.getByRole('img',{ name: 'Photo png' }))
    await userEvent.click(screen.getAllByRole('img',{ name: 'plusen' })[1])
    await userEvent.click(screen.getByRole('img',{ name: 'Photo png' }))
    fireEvent.mouseLeave(screen.getByRole('img',{ name: 'Photo png' }))

    await userEvent.click(screen.getByPlaceholderText('sectexthere'))
    await userEvent.click(screen.getByRole('img',{ name: 'textplus' }))
    await userEvent.click(screen.getByPlaceholderText('sectexthere'))
    fireEvent.mouseLeave(screen.getByPlaceholderText('sectexthere'))

    await userEvent.click(screen.getByPlaceholderText('poweredtext'))
    await userEvent.click(screen.getAllByRole('img',{ name: 'textplus' })[1])
    await userEvent.click(screen.getByPlaceholderText('poweredtext'))
    fireEvent.mouseLeave(screen.getByPlaceholderText('poweredtext'))

    await userEvent.click(screen.getByPlaceholderText('poweredbackground'))
    await userEvent.click(screen.getByPlaceholderText('poweredbackground'))
    fireEvent.mouseLeave(screen.getByPlaceholderText('poweredbackground'))

    await userEvent.click(screen.getByRole('img',{ name: 'poweredimage' }))
    await userEvent.click(screen.getByRole('img',{ name: 'poweredimage' }))
    fireEvent.mouseLeave(screen.getByRole('img',{ name: 'poweredimage' }))

    await userEvent.click(screen.getByText('Reset'))
  })

  it('should render portal demo preview successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const { asFragment } = render(
      <Provider>
        <Form>
          <PortalDemo value={mockDemo} isPreview={true}/>
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )
    expect(asFragment()).toMatchSnapshot()
    await userEvent.click(screen.getAllByText('Click Through')[0])
    await userEvent.click(screen.getAllByText('Guest Pass - Connect')[1])
    await userEvent.click(screen.getAllByText('Guest Pass - Connect')[1])
    await userEvent.click(screen.getAllByText('Guest Pass - Forgot password')[1])
    await userEvent.click(screen.getAllByText('Guest Pass - Forgot password')[1])
    await userEvent.click(screen.getAllByText('Self Sign In - Connect')[1])
    await userEvent.click(screen.getAllByText('Self Sign In - Connect')[1])
    await userEvent.click(screen.getAllByText('Self Sign In - Register/Confirm')[1])
    await userEvent.click(screen.getAllByText('Self Sign In - Register/Confirm')[1])
    await userEvent.click(screen.getAllByText('Host Approval - Register/Confirm')[1])
    await userEvent.click(screen.getAllByText('Host Approval - Register/Confirm')[1])
    await userEvent.click(screen.getAllByText('Connection confirmed')[1])
    await userEvent.click(screen.getAllByText('Connection confirmed')[1])
    await userEvent.click(screen.getAllByText('Terms & Conditions')[1])
  })
})
