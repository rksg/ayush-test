import { fireEvent } from '@testing-library/react'
import userEvent     from '@testing-library/user-event'
import { rest }      from 'msw'

import { QosPriorityEnum, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Provider }                         from '@acx-ui/store'
import { mockServer, render, screen }       from '@acx-ui/test-utils'

import WifiCallingFormContext from '../WifiCallingFormContext'

import WifiCallingConfigureForm from './WifiCallingConfigureForm'


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

const wifiCallingListResponse = [
  {
    networkIds: [
      'c8cd8bbcb8cc42caa33c991437ecb983',
      '44c5604da90443968e1ee91706244e63'
    ],
    qosPriority: 'WIFICALLING_PRI_VOICE',
    serviceName: 'wifiCSP1',
    id: 'ad7309563e004b36861f662bfbfd0144',
    epdgs: [
      {
        ip: '1.2.3.4',
        domain: 'abc.com'
      }
    ]
  }
]

const getWifiCallingResponse = {
  networkIds: [
    'c8cd8bbcb8cc42caa33c991437ecb983',
    '44c5604da90443968e1ee91706244e63'
  ],
  qosPriority: 'WIFICALLING_PRI_VOICE',
  serviceName: 'wifiCSP1',
  id: 'serviceId1',
  epdgs: [
    {
      ip: '1.2.3.4',
      domain: 'abc.com'
    }
  ]
}

const initState = {
  serviceName: '',
  ePDG: [],
  qosPriority: QosPriorityEnum.WIFICALLING_PRI_VOICE,
  tags: [],
  description: '',
  networkIds: [],
  networksName: []
}

describe('WifiCallingConfigureForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        WifiCallingUrls.updateWifiCalling.url,
        (req, res, ctx) => res(ctx.json(wifiCallingServiceResponse))
      ),
      rest.get(
        WifiCallingUrls.getWifiCallingList.url,
        (req, res, ctx) => res(ctx.json(wifiCallingListResponse))
      ),
      rest.put(
        WifiCallingUrls.updateWifiCalling.url,
        (req, res, ctx) => res(ctx.json(wifiCallingServiceResponse))
      ),
      rest.get(
        WifiCallingUrls.getWifiCalling.url,
        (req, res, ctx) => res(ctx.json(getWifiCallingResponse))
      )
    )
  })

  afterAll(() => {
    mockServer.close()
  })

  it('should render wifiCallingConfigureForm successfully', async () => {
    const { asFragment } = render(
      <WifiCallingFormContext.Provider value={{
        state: initState,
        dispatch: jest.fn()
      }}>
        <Provider>
          <WifiCallingConfigureForm />
        </Provider>
      </WifiCallingFormContext.Provider>
      , {
        route: {
          params: { tenantId: 'tenantId1', serviceId: 'serviceId1' }
        }
      }
    )

    expect(screen.getAllByText('Settings')).toBeTruthy()
    expect(screen.getAllByText('Scope')).toBeTruthy()

    await screen.findByRole('heading', { name: 'Settings', level: 3 })

    fireEvent.change(screen.getByRole('textbox', { name: /description/i }),
      { target: { value: 'descriptionTest' } })

    fireEvent.change(screen.getByRole('textbox', { name: /service name/i }),
      { target: { value: 'service-name-test' } })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { name: 'Scope', level: 3 })

    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))

    expect(asFragment()).toMatchSnapshot()
  })
})
