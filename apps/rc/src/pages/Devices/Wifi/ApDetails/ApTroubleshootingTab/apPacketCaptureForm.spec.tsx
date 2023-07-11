import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { venueApi }                              from '@acx-ui/rc/services'
import { WifiUrlsInfo }                          from '@acx-ui/rc/utils'
import { Provider, store }                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import {
  apLanPort,
  apRadio,
  r650Cap,
  r650ap
} from '../../../__tests__/fixtures'

import { ApPacketCaptureForm } from './apPacketCaptureForm'

const params = { tenantId: 'tenant-id', serialNumber: 'serial-number' }
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useApContext: () => params
}))

const packetCaptureReadyResponse = {
  sessionId: '1280ff76-cf09-469b-bb09-c6834102e598',
  fileName: 'pcap-422039000034-20221124015617.tar.gz?GoogleAccessId',
  status: 'READY',
  fileUrl: 'https://storage.googleapis.com/dev-alto-file-storage-1/'
}

const packetCaptureIdleResponse = {
  sessionId: '4c029e56-0032-9a9e-8b45-b46c9a1b0a2b',
  status: 'IDLE'
}

const packetCaptureCapturingResponse = {
  sessionId: '4c029e56-0032-9a9e-8b45-b46c9a1b0a2b',
  status: 'CAPTURING'
}


const packetCaptureStopResponse = {
  sessionId: '4c029e56-0032-9a9e-8b45-b46c9a1b0a2b',
  status: 'STOPPING'
}

const startPacketCackture = {
  requestId: '076b9e36-3637-476a-be0e-1edba6731a55',
  response: {
    sessionId: '076b9e36-3637-476a-be0e-1edba6731a55'
  }
}

const stopPacketCapture = {
  requestId: '2055eee9-0f42-426e-961f-9de4f8f6e435'
}

describe('ApPacketCaptureForm', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(WifiUrlsInfo.getApRadioCustomization.url,
        (req, res, ctx) => res(ctx.json(apRadio))),
      rest.get(WifiUrlsInfo.getApLanPorts.url,
        (req, res, ctx) => res(ctx.json(apLanPort))),
      rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (req, res, ctx) => res(ctx.json(r650ap))),
      rest.get(WifiUrlsInfo.getApCapabilities.url,
        (req, res, ctx) => res(ctx.json(r650Cap))),
      rest.post(WifiUrlsInfo.startPacketCapture.url,
        (req, res, ctx) => res(ctx.json(startPacketCackture))),
      rest.delete(WifiUrlsInfo.stopPacketCapture.url,
        (req, res, ctx) => res(ctx.json(stopPacketCapture))),
      rest.get(WifiUrlsInfo.getPacketCaptureState.url,
        (req, res, ctx) => res(ctx.json(packetCaptureIdleResponse)))
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <ApPacketCaptureForm />
      </Provider>, { route: { params } })
    expect(screen.getByRole('textbox', { name: /MAC Address Filter/i })).toBeVisible()
  })

  it('should download packet capture correctly', async () => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getPacketCaptureState.url,
        (req, res, ctx) => {
          return res(ctx.json(packetCaptureReadyResponse))}
      )
    )

    render(
      <Provider>
        <ApPacketCaptureForm />
      </Provider>, { route: { params } })


    expect(await screen.findByText(/2\.4 ghz/i)).toBeVisible()
    await userEvent.click(screen.getByRole('button', {
      name: /Start/i
    }))

    expect(await screen.findByText(/capturing\.\.\./i)).toBeVisible()
    await userEvent.click(screen.getByRole('button', {
      name: /Stop/i
    }))

    expect(await screen.findByText(/preparing file\.\.\./i)).toBeVisible()
  })

  it('should cpaturing correctly', async () => {
    let response = packetCaptureCapturingResponse
    const requestSpy = jest.fn()

    mockServer.use(
      rest.get(
        WifiUrlsInfo.getPacketCaptureState.url,
        (req, res, ctx) => {
          requestSpy()
          return res(ctx.json(response))}
      )
    )

    render(
      <Provider>
        <ApPacketCaptureForm />
      </Provider>, { route: { params } })

    expect(await screen.findByText(/capturing\.\.\./i)).toBeVisible()
  })

  it('should stopping correctly', async () => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getPacketCaptureState.url,
        (req, res, ctx) => res(ctx.json(packetCaptureStopResponse))
      )
    )

    render(
      <Provider>
        <ApPacketCaptureForm />
      </Provider>, { route: { params } })
    expect(await screen.findByText(/2\.4 ghz/i)).toBeVisible()
  })

  it('should render enable50G correctly', async () => {
    const apRadioResponse = { ...apRadio, enable24G: false, enable50G: true }
    let capResponse = _.cloneDeep(r650Cap)
    capResponse.apModels[0].supportTriRadio = false

    mockServer.use(
      rest.get(
        WifiUrlsInfo.getPacketCaptureState.url,
        (req, res, ctx) => res(ctx.json(packetCaptureIdleResponse))
      ),
      rest.get(WifiUrlsInfo.getApRadioCustomization.url,
        (req, res, ctx) => res(ctx.json(apRadioResponse))),
      rest.get(WifiUrlsInfo.getApCapabilities.url,
        (req, res, ctx) => res(ctx.json(capResponse)))
    )
    render(
      <Provider>
        <ApPacketCaptureForm />
      </Provider>, { route: { params } })

    expect(await screen.findByText(/5 ghz/i)).toBeVisible()
  })

  it('should handle error occurred for start packet capture', async () => {
    mockServer.use(
      rest.post(WifiUrlsInfo.startPacketCapture.url,
        (_, res, ctx) => {
          return res(ctx.status(400), ctx.json({ errors: [{ code: 'WIFI-xxxx' }] }))
        })
    )

    render(
      <Provider>
        <ApPacketCaptureForm />
      </Provider>, { route: { params } })

    await userEvent.click(screen.getByRole('button', {
      name: /Start/i
    }))

    // TODO
    // expect(await screen.findByText('Server Error')).toBeVisible()
  })

  it('should handle error occurred for stop packet capture', async () => {
    mockServer.use(
      rest.post(WifiUrlsInfo.startPacketCapture.url,
        (req, res, ctx) => res(ctx.json(startPacketCackture))),
      rest.post(WifiUrlsInfo.stopPacketCapture.url,
        (_, res, ctx) => {
          return res(ctx.status(400), ctx.json({ errors: [{ code: 'WIFI-xxxx' }] }))
        })
    )

    render(
      <Provider>
        <ApPacketCaptureForm />
      </Provider>, { route: { params } })

    await userEvent.click(screen.getByRole('button', {
      name: /Start/i
    }))
    expect(await screen.findByText(/capturing\.\.\./i)).toBeVisible()
    await userEvent.click(screen.getByRole('button', {
      name: /Stop/i
    }))
    // expect(await screen.findByText('Server Error')).toBeVisible()
  })

  it('should select wired correctly', async () => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getPacketCaptureState.url,
        (req, res, ctx) => {
          return res(ctx.json(packetCaptureIdleResponse))}
      )
    )
    render(
      <Provider>
        <ApPacketCaptureForm />
      </Provider>, { route: { params } })

    expect(await screen.findByText(/2\.4 ghz/i)).toBeVisible()
    fireEvent.mouseDown(await screen.findByText(/2\.4 ghz/i))
    await userEvent.click(await screen.getAllByText('Wired')[0])
    expect(await screen.findByText(/lan port:/i)).toBeVisible()
    const macAddressField = screen.getByRole('textbox', {
      name: /mac address filter:/i
    })
    fireEvent.change(macAddressField, { target: { value: 'AA:AA:AA:AA:AA:AA' } })

    await userEvent.click(screen.getByRole('button', {
      name: /Start/i
    }))

    expect(await screen.findByText(/capturing\.\.\./i)).toBeVisible()
    await userEvent.click(screen.getByRole('button', {
      name: /Stop/i
    }))
  })
})

describe('ApPacketCaptureForm - validation', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(WifiUrlsInfo.getApRadioCustomization.url,
        (req, res, ctx) => res(ctx.json(apRadio))),
      rest.get(WifiUrlsInfo.getApLanPorts.url,
        (req, res, ctx) => res(ctx.json(apLanPort))),
      rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (req, res, ctx) => res(ctx.json(r650ap))),
      rest.get(WifiUrlsInfo.getApCapabilities.url,
        (req, res, ctx) => res(ctx.json(r650Cap))),
      rest.post(WifiUrlsInfo.startPacketCapture.url,
        (req, res, ctx) => res(ctx.json(startPacketCackture))),
      rest.post(WifiUrlsInfo.stopPacketCapture.url,
        (req, res, ctx) => res(ctx.json(stopPacketCapture))),
      rest.get(WifiUrlsInfo.getPacketCaptureState.url,
        (req, res, ctx) => res(ctx.json(packetCaptureIdleResponse)))
    )
  })

  it('should validate field correctly', async () => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getPacketCaptureState.url,
        (req, res, ctx) => res(ctx.json(packetCaptureIdleResponse))
      )
    )
    render(
      <Provider>
        <ApPacketCaptureForm />
      </Provider>, { route: { params } })

    const macAddressField = screen.getByRole('textbox', {
      name: /mac address filter:/i
    })
    fireEvent.change(macAddressField, { target: { value: 'test' } })
    expect(await screen.findByText('This field is invalid')).toBeVisible()
    fireEvent.change(macAddressField, { target: { value: 'AA:AA:AA:AA:AA:AA' } })
    await userEvent.click(screen.getByRole('button', {
      name: /Start/i
    }))
    expect(await screen.findByText(/capturing\.\.\./i)).toBeVisible()
  })


})
