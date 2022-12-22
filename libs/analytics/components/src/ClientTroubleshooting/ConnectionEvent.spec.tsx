import { cleanup, render, fireEvent, screen } from '@acx-ui/test-utils'

import { DisplayEvent }           from './config'
import { ConnectionEventPopover } from './ConnectionEvent'

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
      type: 'ap',
      name: '94:B3:4F:3D:15:B0'
    }
  ],
  code: null,
  state: 'normal',
  failedMsgId: null,
  radio: '5',
  start: 1668407611646,
  end: 1668407611646,
  category: 'success'
}

const slowEvent = {
  ...successEvent,
  category: 'slow',
  ttc: 1000
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
      type: 'ap',
      name: '94:B3:4F:3D:15:B0'
    }
  ],
  ttc: null,
  timestamp: '2022-11-14T06:33:31.646Z'
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
      type: 'ap',
      name: '94:B3:4F:3D:15:B0'
    }
  ],
  ttc: null,
  timestamp: '2022-11-14T06:33:31.646Z',
  messageIds: ['21', '22']
}

const unknownRadio = {
  ...successEvent,
  radio: ''
}

const unknownFailure = {
  ...failureEvent,
  code: null
}

const nullFailedIdFailure = {
  ...failureEvent,
  failedMsgId: null
}

const emptyMessageIds = {
  ...failureEvent,
  messageIds: []
}

describe('ConnectionEvent', () => {

  afterEach(() => cleanup())

  it('renders correctly for success event', async () => {
    const { asFragment } =
      render(<ConnectionEventPopover event={successEvent}>test</ConnectionEventPopover>)
    fireEvent.click(await screen.findByText(/test/i))
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders correctly for failureEvent event', async () => {
    const { asFragment } =
      render(<ConnectionEventPopover event={failureEvent}>test</ConnectionEventPopover>)
    fireEvent.click(await screen.findByText(/test/i))
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders correctly for disconnect event', async () => {
    const { asFragment } =
      render(<ConnectionEventPopover event={disconnectEvent}>test</ConnectionEventPopover>)
    fireEvent.click(await screen.findByText(/test/i))
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders correctly for slow event', async () => {
    const { asFragment } =
      render(<ConnectionEventPopover event={slowEvent}>test</ConnectionEventPopover>)
    fireEvent.click(await screen.findByText(/test/i))
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders correctly for unknown radio', async () => {
    const { asFragment } =
      render(<ConnectionEventPopover event={unknownRadio}>test</ConnectionEventPopover>)
    fireEvent.click(await screen.findByText(/test/i))
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders correctly for unknown failure', async () => {
    const { asFragment } =
      render(<ConnectionEventPopover event={unknownFailure}>test</ConnectionEventPopover>)
    fireEvent.click(await screen.findByText(/test/i))
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders correctly for null failedMsgId', async () => {
    const { asFragment } =
      render(<ConnectionEventPopover event={nullFailedIdFailure}>test</ConnectionEventPopover>)
    fireEvent.click(await screen.findByText(/test/i))
    expect(asFragment()).toMatchSnapshot()
  })


  it('renders correctly for null empty messageId', async () => {
    const { asFragment } =
      render(<ConnectionEventPopover event={emptyMessageIds}>test</ConnectionEventPopover>)
    fireEvent.click(await screen.findByText(/test/i))
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders correctly on popover close', async () => {
    const { asFragment } =
      render(<ConnectionEventPopover event={successEvent}>test</ConnectionEventPopover>)
    const original = asFragment()
    fireEvent.click(await screen.findByText(/test/i))
    fireEvent.click(await screen.findByTestId(/CloseSymbol/i))
    const closed = asFragment()
    expect(original).toMatchObject(closed)
  })
})