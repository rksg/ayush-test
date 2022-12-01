
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { PortalUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import PortalInstance from '.'

const pList =[{
  id: 2,
  serviceName: 'test2',
  demo: {
    welcomeText: 'Welcome to the Guest Access login page',
    welcomeColor: '#333333',
    backgroundImage: '',
    backgroundColor: '#FFFFFF',
    welcomeSize: 14,

    photoSize: 170,

    logoSize: 105,
    secondaryText: 'Lorem ipsum dolor sit amet, consectetur adipiscing'+
    ' elit. Aenean euismod bibendum laoreet.',
    secondaryColor: '#333333',
    secondarySize: 14,
    buttonColor: '#EC7100',
    poweredBackgroundColor: '#FFFFFF',
    poweredColor: '#333333',
    poweredSize: 14,
    poweredImgSize: 50,
    wifi4EU: '',
    termsCondition: '',
    componentDisplay: {
      Logo: true,
      WelcomeText: true,
      Photo: true,
      SecondaryText: true,
      TermsConditions: false,
      PoweredBy: true,
      WiFi4EU: false
    },
    displayLang: 'English',

    alternativeLang:

    { Czech: false, ChineseTraditional: false, French: false }
  }
}
]

describe('Portal Instance Page', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        PortalUrlsInfo.getPortalProfileList.url,
        (req, res, ctx) => res(ctx.json(pList))
      )
    )
  })

  it('should render instance page', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const { asFragment } = render(<Provider><Form><PortalInstance/></Form></Provider>,
      {
        route: { params }
      })
    expect(asFragment()).toMatchSnapshot()
    await userEvent.click(await screen.findByText('Add Guest Portal Service'))
    await userEvent.click(await screen.findByText('Cancel'))
    await userEvent.click(await screen.findByText('Add Guest Portal Service'))
    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Service Name' }),'create Portal test')
    await userEvent.click(await screen.findByText('Reset'))
    await userEvent.click(await screen.findByText('Finish'))
    await userEvent.click(await screen.findByRole('combobox'))
    await userEvent.click(await screen.findByTitle('test2'))
  })
})
