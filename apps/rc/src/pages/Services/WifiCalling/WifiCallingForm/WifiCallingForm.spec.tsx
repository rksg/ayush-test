import { fireEvent } from '@testing-library/react'
import userEvent     from '@testing-library/user-event'
import { rest }      from 'msw'

import { QosPriorityEnum, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Provider }                         from '@acx-ui/store'
import { mockServer, render, screen }       from '@acx-ui/test-utils'

import WifiCallingFormContext from '../WifiCallingFormContext'

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

const initState = {
  serviceName: '',
  ePDG: [],
  qosPriority: QosPriorityEnum.WIFICALLING_PRI_VOICE,
  tags: [],
  description: '',
  networkIds: [],
  networksName: [],
  epdgs: []
}

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = ({ children, onChange, ...otherProps }) =>
    <select
      role='combobox'
      onChange={e => onChange(e.target.value)}
      {...otherProps}>
      {children}
    </select>

  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) =>
    <option role='option' {...otherProps}>{children}</option>

  return { ...antd, Select }
})

describe.skip('WifiCallingForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        WifiCallingUrls.addWifiCalling.url,
        (req, res, ctx) => res(ctx.json(wifiCallingServiceResponse))
      ),
      rest.get(
        WifiCallingUrls.getWifiCallingList.url,
        (req, res, ctx) => res(ctx.json(wifiCallingListResponse))
      )
    )
  })

  afterAll(() => {
    mockServer.close()
  })

  it('should render wifiCallingForm successfully', async () => {
    render(
      <WifiCallingFormContext.Provider value={{
        state: initState,
        dispatch: jest.fn()
      }}>
        <Provider>
          <WifiCallingForm />
        </Provider>
      </WifiCallingFormContext.Provider>
      , {
        route: {
          path: '/services/wifiCalling/create',
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.getAllByText('Settings')).toBeTruthy()
    expect(screen.getAllByText('Scope')).toBeTruthy()
    expect(screen.getAllByText('Summary')).toBeTruthy()

    await screen.findByRole('heading', { name: 'Settings', level: 3 })

    fireEvent.change(screen.getByRole('textbox', { name: /service name/i }),
      { target: { value: 'wifiCSP1' } })

    fireEvent.change(screen.getByRole('textbox', { name: /service name/i }),
      { target: { value: 'serviceNameTest' } })

    fireEvent.change(screen.getByRole('textbox', { name: /description/i }),
      { target: { value: 'descriptionTest' } })

    const addButton = screen.getByRole('button', { name: 'Add' })
    fireEvent.click(addButton)
    expect(screen.getByText('Add ePDG')).toBeInTheDocument()

    const domainInput = screen.getByPlaceholderText('Please enter the domain name')
    const ipInput = screen.getByPlaceholderText('Please enter the ip address')
    fireEvent.change(domainInput,
      { target: { value: 'aaa.bbb.com' } })
    fireEvent.change(ipInput,
      { target: { value: '10.10.10.10' } })
    expect(domainInput).toHaveValue('aaa.bbb.com')
    expect(ipInput).toHaveValue('10.10.10.10')

    const saveButton = await screen.findByText('Save')
    expect(saveButton).toBeInTheDocument()
    fireEvent.click(saveButton)

    await screen.findByTestId('selectQosPriorityId')

    fireEvent.select(screen.getByTestId('selectQosPriorityId'), {
      target: { name: 'Video' }
    })

    await userEvent.click(screen.getByRole('combobox'))

    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'Video' })
    )

    await screen.findAllByText('Video')

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { name: 'Scope', level: 3 })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { name: 'Summary', level: 3 })

    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <WifiCallingFormContext.Provider value={{
        state: initState,
        dispatch: jest.fn()
      }}>
        <Provider>
          <WifiCallingForm />
        </Provider>
      </WifiCallingFormContext.Provider>
      , {
        route: {
          path: '/services/wifiCalling/create',
          params: { tenantId: 'tenantId1' }
        }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Wi-Fi Calling'
    })).toBeVisible()
  })

  it('should render wifiCallingForm and cancel the step successfully', async () => {
    render(
      <WifiCallingFormContext.Provider value={{
        state: initState,
        dispatch: jest.fn()
      }}>
        <Provider>
          <WifiCallingForm />
        </Provider>
      </WifiCallingFormContext.Provider>
      , {
        route: {
          path: '/services/wifiCalling/create',
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.getAllByText('Settings')).toBeTruthy()
    expect(screen.getAllByText('Scope')).toBeTruthy()
    expect(screen.getAllByText('Summary')).toBeTruthy()

    await screen.findByRole('heading', { name: 'Settings', level: 3 })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  })
})
