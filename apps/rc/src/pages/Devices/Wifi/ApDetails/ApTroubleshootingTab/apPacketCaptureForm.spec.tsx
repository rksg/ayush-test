import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import FileSaver from 'file-saver'
import { rest }  from 'msw'

import { venueApi }                              from '@acx-ui/rc/services'
import { WifiUrlsInfo }          from '@acx-ui/rc/utils'
import { Provider, store }                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import {
  apLanPort,
  apRadio,
  r650Cap,
  r650ap
} from '../../__tests__/fixtures'

import { ApPacketCaptureForm } from './apPacketCaptureForm'







const params = { tenantId: 'tenant-id', serialNumber: 'serial-number' }


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

// apLanPort
// apRadio
// r650Cap
// r650ap

describe('ApSettingsTab', () => {

  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(WifiUrlsInfo.getApRadioCustomization.url,
        (req, res, ctx) => res(ctx.json(apRadio))),
      rest.get(WifiUrlsInfo.getApLanPorts.url,
        (req, res, ctx) => res(ctx.json(apLanPort))),
      rest.get(WifiUrlsInfo.getAp.url,
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
  it('should render correctly', async () => {
    const { asFragment } = render(
      <Provider>
        <ApPacketCaptureForm />
      </Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should download capture correctly', async () => {
    const downloadSpy = jest.spyOn(FileSaver, 'saveAs')

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


    mockServer.use(
      rest.get(
        WifiUrlsInfo.getPacketCaptureState.url,
        (req, res, ctx) => res(ctx.json(packetCaptureReadyResponse))
      )
    )

    expect(await screen.findByText(/preparing file\.\.\./i)).toBeVisible()

  })


  it('should cpaturing correctly', async () => {
    const downloadSpy = jest.spyOn(FileSaver, 'saveAs')
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getPacketCaptureState.url,
        (req, res, ctx) => res(ctx.json(packetCaptureCapturingResponse))
      )
    )

    render(
      <Provider>
        <ApPacketCaptureForm />
      </Provider>, { route: { params } })

    expect(await screen.findByText(/capturing\.\.\./i)).toBeVisible()

    await userEvent.click(screen.getByRole('button', {
      name: /Stop/i
    }))

    rest.get(
      WifiUrlsInfo.getPacketCaptureState.url,
      (req, res, ctx) => res(ctx.json(packetCaptureReadyResponse))
    )

    // expect(await downloadSpy).toHaveBeenCalled()
    // expect(await downloadSpy).toHaveBeenCalled()
    await screen.findByText(/capture interface:/i)

  })
})
