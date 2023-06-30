import {
  screen,
  fireEvent,
  act,
  within,
  waitFor
} from '@testing-library/react'
import { message } from 'antd'
import { rest }    from 'msw'
import '@testing-library/jest-dom'

import {
  CommonUrlsInfo,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import { mockServer, renderHook } from '@acx-ui/test-utils'

import { useApActions } from '.'

const serialNumber = ':serialNumber'
const tenantId = ':tenantId'

const apList = {
  totalCount: 1,
  page: 1,
  data: [
    {
      serialNumber: '000000000001',
      name: 'mock-ap-1',
      model: 'R510',
      fwVersion: '6.2.0.103.261', // invalid Ap Fw version for reset
      venueId: '01d74a2c947346a1a963a310ee8c9f6f',
      venueName: 'Mock-Venue',
      deviceStatus: '2_00_Operational',
      IP: '10.00.000.101',
      apMac: '00:00:00:00:00:01',
      apStatusData: {
        APRadio: [
          {
            txPower: null,
            channel: 10,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            txPower: null,
            channel: 120,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: '4fe4e02d7ef440c4affd28c620f93073',
      tags: '',
      deviceGroupName: ''
    }
  ]
}

describe('Test useApActions', () => {

  beforeEach(() => {
    message.destroy()

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(apList))
      ),
      rest.post(
        WifiUrlsInfo.getDhcpAp.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456', response: [{
          venueDhcpEnabled: true
        }] }))
      ),
      rest.delete(
        WifiUrlsInfo.deleteAp.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.patch(
        WifiUrlsInfo.rebootAp.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      ),
      rest.patch(
        WifiUrlsInfo.blinkLedAp.url,
        (req, res, ctx) => res(ctx.json({ requestId: '789' }))
      ),
      rest.get(
        WifiUrlsInfo.downloadApLog.url,
        (req, res, ctx) => res(ctx.json({ fileURL: '/abc.tar.gz' }))
      )
    )
  })

  it('showDeleteAp', async () => {
    const { result } = renderHook(() => useApActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { showDeleteAp } = result.current
    const callback = jest.fn()

    act(() => {
      showDeleteAp(serialNumber, tenantId, callback)
    })
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Are you sure you want to delete')

    expect(dialog).toHaveTextContent('Once deleted, the AP will factory reset to Cloud ready')

    expect(dialog).toHaveTextContent('The AP\'s firmware does not support reset')

    const deleteBtn = within(dialog).getByRole('button', { name: 'Delete' })

    fireEvent.click(deleteBtn)

    await waitFor(async () => expect(callback).toBeCalled())

    expect(dialog).not.toBeVisible()

    jest.clearAllMocks()
  })

  it('showRebootAp', async () => {
    const { result } = renderHook(() => useApActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { showRebootAp } = result.current
    const callback = jest.fn()

    act(() => {
      showRebootAp(serialNumber, tenantId, callback)
    })
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Rebooting the AP will disconnect all connected clients')

    fireEvent.click(within(dialog).getByRole('button', { name: 'Reboot' }))

    expect(callback).toBeCalled()
  })

  it('showDownloadApLog', async () => {
    const { result } = renderHook(() => useApActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { showDownloadApLog } = result.current
    const callback = jest.fn()

    act(() => {
      showDownloadApLog(serialNumber, tenantId, callback)
    })

    expect(await screen.findByTestId('toast-content')).toHaveTextContent('Preparing log')

    expect(await screen.findByText('Log is ready', { exact: false })).toBeVisible()

    expect(callback).toBeCalled()
  })

  it('showBlinkLedAp', async () => {
    const { result } = renderHook(() => useApActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { showBlinkLedAp } = result.current

    act(() => {
      showBlinkLedAp(serialNumber, tenantId)
    })

    expect(await screen.findByTestId('toast-content')).toHaveTextContent('AP LEDs Blink')
  })
})
