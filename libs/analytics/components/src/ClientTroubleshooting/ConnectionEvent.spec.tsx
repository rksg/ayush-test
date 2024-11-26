import { useState } from 'react'

import { get }                                from '@acx-ui/config'
import { Provider }                           from '@acx-ui/store'
import { cleanup, render, fireEvent, screen } from '@acx-ui/test-utils'

import { BTM_REQUEST, BTM_RESPONSE, DisplayEvent }           from './config'
import { ConnectionEventPopover, getRoamingTypeDisplayText } from './ConnectionEvent'

const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  ...jest.requireActual('@acx-ui/config'),
  get: jest.fn()
}))

const successEvent: DisplayEvent = {
  timestamp: '2022-11-14T06:33:31.646Z',
  event: 'EVENT_CLIENT_ROAMING',
  ttc: null,
  mac: '94:B3:4F:3D:15:B0',
  apName: 'R750-11-112',
  path: [
    {
      type: 'zone',
      name: 'cliexp4'
    },
    {
      type: 'apGroup',
      name: 'No group (inherit from Venue)'
    },
    {
      type: 'AP',
      name: '94:B3:4F:3D:15:B0'
    }
  ],
  code: null,
  state: 'normal',
  failedMsgId: null,
  radio: '5',
  start: 1668407611646,
  end: 1668407611646,
  category: 'success',
  ssid: 'cliexp4',
  key: 'sucessKey',
  roamingType: 'PMK',
  type: 'roaming'
}

const slowEvent = {
  ...successEvent,
  category: 'slow',
  ttc: 1000,
  key: 'slowKey'
}

const disconnectEvent: DisplayEvent = {
  event: 'EVENT_CLIENT_DISCONNECT',
  mac: '94:B3:4F:3D:15:B0',
  apName: 'R750-11-112',
  code: null,
  state: 'normal',
  failedMsgId: '3',
  radio: '5',
  start: 1668407707441,
  end: 1668407707441,
  category: 'disconnect',
  path: [
    {
      type: 'zone',
      name: 'cliexp4'
    },
    {
      type: 'apGroup',
      name: 'No group (inherit from Venue)'
    },
    {
      type: 'AP',
      name: '94:B3:4F:3D:15:B0'
    }
  ],
  ttc: null,
  timestamp: '2022-11-14T06:33:31.646Z',
  key: 'disconnectKey'
}

const btmRequestEvent: DisplayEvent = {
  ...successEvent,
  category: BTM_REQUEST,
  event: 'EVENT_CLIENT_BTM_REQ_SENT',
  key: 'btmRequestKey',
  btmInfo: 'sticky client'
}

const btmResponseEvent: DisplayEvent = {
  ...successEvent,
  category: BTM_RESPONSE,
  event: 'EVENT_CLIENT_BTM_RESP_RECEIVED',
  key: 'btmResponseKey',
  btmInfo: 'BTM_EVENT_RECEIVE_REJECT'
}

const failureEvent: DisplayEvent = {
  apName: 'R750-11-112',
  category: 'failure',
  code: 'eapol',
  end: 1668407704571,
  event: 'CCD_REASON_MIC_FAILURE',
  failedMsgId: '22',
  mac: 'AA:AA:AA:AA:AA:AA',
  radio: '5',
  start: 1668407704571,
  state: 'normal',
  path: [
    {
      type: 'zone',
      name: 'cliexp4'
    },
    {
      type: 'apGroup',
      name: 'No group (inherit from Venue)'
    },
    {
      type: 'AP',
      name: '94:B3:4F:3D:15:B0'
    }
  ],
  ttc: null,
  timestamp: '2022-11-14T06:33:31.646Z',
  messageIds: ['21', '22'],
  key: 'failureKey'
}

const unknownRadio = {
  ...successEvent,
  radio: '',
  key: 'unknownKey'
}

const unknownFailure = {
  ...failureEvent,
  code: null,
  key: 'unknownFailure'
}

const nullFailedIdFailure = {
  ...failureEvent,
  failedMsgId: null,
  key: 'nullFailureMsg'
}

const emptyMessageIds = {
  ...failureEvent,
  messageIds: [],
  key: 'emptyMsgKey'
}

const nullMsgIds = {
  ...failureEvent,
  messageIds: null as unknown as undefined,
  key: 'nullMsgKey'
}

const pcapFailure = {
  ...failureEvent,
  key: 'pcapFailure',
  pcapFilename: 'test.pcap'
}

describe('ConnectionEvent', () => {

  beforeEach(() => jest.clearAllMocks())
  afterEach(() => cleanup())

  it('renders correctly for success event', () => {
    mockGet.mockReturnValue('true')
    render(<ConnectionEventPopover event={successEvent}>test</ConnectionEventPopover>)
    fireEvent.click(screen.getByText(/test/i))
    expect(screen.getByText(successEvent.mac)).toHaveTextContent(successEvent.mac)
    expect(screen.getByText(successEvent.apName)).toHaveTextContent(successEvent.apName)
    const stringSsid = successEvent.ssid as string
    expect(screen.getByText(stringSsid)).toHaveTextContent(stringSsid)
    expect(screen.getByText(/5 GHz/i)).toHaveTextContent(/5 GHz/i)
    expect(screen.getByText(/PMK/i)).toHaveTextContent(/PMK/i)
  })

  it('renders correctly for failureEvent event', () => {
    render(<ConnectionEventPopover event={failureEvent}>test</ConnectionEventPopover>)
    fireEvent.click(screen.getByText(/test/i))
    expect(screen.getByText('AP (AA:AA:AA:AA:AA:AA)'))
      .toHaveTextContent('AP (AA:AA:AA:AA:AA:AA)')
    expect(screen.getByText(/4-Way Handshake - Frame 1/i))
      .toHaveTextContent(/4-Way Handshake - Frame 1/i)
    expect(screen.getByText(/4-Way Handshake - Frame 2/i))
      .toHaveTextContent(/4-Way Handshake - Frame 2/i)
  })

  it('renders correctly for disconnect event', async () => {
    render(<ConnectionEventPopover event={disconnectEvent}>test</ConnectionEventPopover>)
    fireEvent.click(await screen.findByText(/test/i))
    expect(screen.getByText('Disconnect Type')).toBeValid()
    expect(screen.getByText('Client disconnected')).toBeValid()
    expect(screen.getByText(
      'Deauthenticated because sending STA is leaving (or has left) IBSS or ESS (reason code 3)'
    )).toBeValid()
    expect(screen.getByText('Reason')).toBeValid()
  })

  it('renders correctly for slow event', () => {
    render(<ConnectionEventPopover event={slowEvent}>test</ConnectionEventPopover>)
    fireEvent.click(screen.getByText(/test/i))
    expect(screen.getByText(/Time to Connect/i)).toHaveTextContent(/Time to Connect/i)
    expect(screen.getByText(/1 s/i)).toHaveTextContent(/1 s/i)
  })

  it('renders correctly for unknown radio', () => {
    render(<ConnectionEventPopover event={unknownRadio}>test</ConnectionEventPopover>)
    fireEvent.click(screen.getByText(/test/i))
    expect(screen.getByText(/Unknown/i)).toHaveTextContent(/Unknown/i)
  })

  it('renders correctly for unknown failure', () => {
    render(<ConnectionEventPopover event={unknownFailure}>test</ConnectionEventPopover>)
    fireEvent.click(screen.getByText(/test/i))
    expect(screen.getByText(/Unknown/i)).toHaveTextContent(/Unknown/i)
  })

  it('renders correctly for null failedMsgId', () => {
    const { asFragment } =
      render(<ConnectionEventPopover event={nullFailedIdFailure}>test</ConnectionEventPopover>)
    fireEvent.click(screen.getByText(/test/i))
    const test = asFragment().querySelectorAll('section')
    expect(test).toHaveLength(0)
  })

  it('renders correctly for empty messageId', () => {
    const { asFragment } =
      render(<ConnectionEventPopover event={emptyMessageIds}>test</ConnectionEventPopover>)
    fireEvent.click(screen.getByText(/test/i))
    const test = asFragment().querySelectorAll('section')
    expect(test).toHaveLength(0)
  })

  it('renders correctly for null messageId', () => {
    const { asFragment } =
      render(<ConnectionEventPopover event={nullMsgIds}>test</ConnectionEventPopover>)
    fireEvent.click(screen.getByText(/test/i))
    const test = asFragment().querySelectorAll('section')
    expect(test).toHaveLength(0)
  })

  it('renders correctly for pcap downloads', () => {
    const { asFragment } =
      render(<ConnectionEventPopover event={pcapFailure}>test</ConnectionEventPopover>,
        { wrapper: Provider }
      )
    fireEvent.click(screen.getByText(/test/i))
    const test = asFragment().querySelectorAll('section')
    expect(test).toHaveLength(0)
  })

  it('renders correctly on popover close', () => {
    const mockVisibleChange = jest.fn((val: boolean) => val)
    const TestWrapper = () => {
      const [visible, setVisible] = useState(false)
      const onVisibleChange = (val: boolean) => {
        mockVisibleChange(val)
        setVisible(val)
      }
      return <ConnectionEventPopover
        event={successEvent}
        onVisibleChange={onVisibleChange}
        visible={visible}
      >
      test
      </ConnectionEventPopover>
    }

    const { asFragment } = render(<TestWrapper/>)
    const original = asFragment()
    fireEvent.click(screen.getByText(/test/i))
    expect(mockVisibleChange).toBeCalledWith(true)
    fireEvent.click(screen.getByTestId(/CloseSymbol/i))
    expect(mockVisibleChange).toHaveBeenLastCalledWith(false)
    const closed = asFragment()
    expect(original).toMatchObject(closed)
  })

  it('should return roaming type dislplay text corectly', () => {
    [
      { type: 'OKC', text: 'OKC Roaming' },
      { type: 'PMK', text: 'PMKID Roaming' },
      { type: 'full-802.11', text: 'Full Authentication' },
      { type: '11r', text: '11r Over-the-Air' },
      { type: 'FT - Over-the-Air', text: '11r Over-the-Air' },
      { type: 'FT - Over-the-DS', text: '11r Over-the-DS' },
      { type: 'Full Authentication', text: 'Full Authentication' },
      { type: 'random', text: 'random' } // unmapped
    ].forEach(({ type, text }) => {
      expect(getRoamingTypeDisplayText(type)).toBe(text)
    })
  })
  it('renders correctly for btm request event', async () => {
    render(<ConnectionEventPopover event={btmRequestEvent}>test</ConnectionEventPopover>)
    fireEvent.click(await screen.findByText(/test/i))
    expect(screen.getByText('Trigger')).toBeValid()
    expect(screen.getByText('sticky')).toBeValid()
  })

  it('renders correctly for btm response event', async () => {
    render(<ConnectionEventPopover event={btmResponseEvent}>test</ConnectionEventPopover>)
    fireEvent.click(await screen.findByText(/test/i))
    expect(screen.getByText('Status')).toBeValid()
    expect(screen.getByText('REJECTED')).toBeValid()
  })
})