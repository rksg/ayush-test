import { userEvent } from '@storybook/testing-library'
import { rest }      from 'msw'

import { EPDG, QosPriorityEnum, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Provider }                               from '@acx-ui/store'
import { mockServer, render, screen }             from '@acx-ui/test-utils'

import WifiCallingFormContext from '../WifiCallingFormContext'

import WifiCallingConfigureForm from './WifiCallingConfigureForm'

const wifiCallingServiceResponse = {
  id: 'serviceId1',
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

const serviceName = ''
const description = ''
const profileName = ''
const qosPriority: QosPriorityEnum = QosPriorityEnum.WIFICALLING_PRI_VOICE
const tags: string[] = []
const ePDG: EPDG[] = []
const networkIds: string[] = []
const networksName: string[] = []

const initState = {
  serviceName,
  profileName,
  ePDG,
  qosPriority,
  tags,
  description,
  networksName,
  networkIds
}

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}
const setWifiCallingConfigure = jest.fn()

describe('WifiCallingConfigureForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.put(
        WifiCallingUrls.updateWifiCalling.url,
        (req, res, ctx) => res(ctx.json(wifiCallingServiceResponse))
      )
    )
  })

  it('should render wifiCallingConfigureForm successfully', async () => {
    const { asFragment } = render(<WifiCallingFormContext.Provider value={{
      state: initState,
      dispatch: setWifiCallingConfigure
    }}>
      <WifiCallingConfigureForm />
    </WifiCallingFormContext.Provider>, {
      wrapper: wrapper,
      route: {
        params: { serviceId: 'serviceId1', tenantId: 'tenantId1' }
      }
    })

    expect(screen.getAllByText('Settings')).toBeTruthy()
    expect(screen.getAllByText('Scope')).toBeTruthy()

    userEvent.click(screen.getByRole('button', {
      name: /next/i
    }))

    expect(asFragment()).toMatchSnapshot()
  })
})
