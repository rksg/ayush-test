import { fireEvent } from '@testing-library/react'
import { rest }      from 'msw'

import { WifiCallingUrls }            from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import WifiCallingForm from './WifiCallingForm'


const wifiCallingServiceResponse = {
  id: 'wifiCallingProfileId1',
  profileName: 'att',
  description: '',
  qosPriority: 'WIFICALLING_PRI_VOICE', //Allowed values are "WIFICALLING_PRI_VOICE", "WIFICALLING_PRI_VIDEO", "WIFICALLING_PRI_BE", "WIFICALLING_PRI_BG"
  ePDGs: [{
    name: 'att1',
    domain: 'epdg.epc.att.net',
    ip: ''

  }, {
    name: 'att2',
    domain: 'sentitlement2.mobile.att.net',
    ip: ''

  },{
    name: 'att3',
    domain: 'vvm.mobile.att.net',
    ip: '1.1.1.1'

  }],
  networkIds: [
    'networkId1',
    'networkId2',
    'networkId3'
  ],
  tags: [
    'tag1',
    'tag2'
  ]
}

describe('WifiCallingForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        WifiCallingUrls.addWifiCalling.url,
        (req, res, ctx) => res(ctx.json(wifiCallingServiceResponse))
      )
    )
  })

  afterAll(() => {
    mockServer.close()
  })

  it('should render wifiCallingForm successfully', async () => {
    const { asFragment } = render(
      <Provider>
        <WifiCallingForm />
      </Provider>, {
        route: { path: '/services/wifiCalling/create' }
      }
    )

    expect(screen.getAllByText('Settings')).toBeTruthy()
    expect(screen.getAllByText('Scope')).toBeTruthy()
    expect(screen.getAllByText('Summary')).toBeTruthy()

    fireEvent.change(screen.getByRole('textbox', { name: /service name/i }),
      { target: { value: 'servieName1' } })

    fireEvent.click(screen.getByText('Next'))

    await screen.findAllByText('Scope')
    fireEvent.click(screen.getByText('Next'))

    expect(asFragment()).toMatchSnapshot()
  })
})
