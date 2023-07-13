import {
  screen,
  fireEvent,
  act,
  within,
  waitFor
} from '@testing-library/react'
import { message, Modal } from 'antd'
import { rest }           from 'msw'
import '@testing-library/jest-dom'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  SwitchStatusEnum,
  SwitchUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import { mockServer, renderHook } from '@acx-ui/test-utils'

import { useSwitchActions } from '.'

const tenantId = ':tenantId'

const switchList = {
  totalCount: 2,
  page: 1,
  data: [
    { id: 'FEK4224R19X',
      model: 'ICX7150-C12P',
      serialNumber: 'FEK4224R19X',
      activeSerial: 'FEK4224R19X',
      deviceStatus: SwitchStatusEnum.NEVER_CONTACTED_CLOUD,
      switchMac: '',
      isStack: false,
      name: 'FEK4224R19X',
      venueId: 'eb4ef94ba7014f64b69be926faccbc09',
      venueName: 'test',
      configReady: false,
      syncDataEndTime: '',
      cliApplied: false,
      formStacking: true,
      suspendingDeployTime: '' },
    {
      id: 'FMF2249Q0JT',
      model: 'ICX7150-C08P',
      serialNumber: 'FMF2249Q0JT',
      activeSerial: 'FMF2249Q0JT',
      deviceStatus: SwitchStatusEnum.NEVER_CONTACTED_CLOUD,
      switchMac: '',
      isStack: false,
      name: 'FMF2249Q0JT',
      venueId: '5c05180d54d84e609a4d653a3a8332d1',
      venueName: 'My-Venue',
      configReady: false,
      syncDataEndTime: '',
      cliApplied: false,
      formStacking: false,
      suspendingDeployTime: ''
    }
  ]
}

describe('Test useSwitchActions', () => {

  beforeEach(() => {
    message.destroy()
    mockServer.use(
      rest.delete(
        SwitchUrlsInfo.deleteSwitches.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.post(
        SwitchUrlsInfo.reboot.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.post(
        SwitchUrlsInfo.syncData.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.post(
        SwitchUrlsInfo.retryFirmwareUpdate.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('showDeleteSwitches', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useSwitchActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { showDeleteSwitches } = result.current
    const callback = jest.fn()

    act(() => {
      showDeleteSwitches(switchList.data, tenantId, callback)
    })
    const dialog = await screen.findByRole('dialog')

    const deleteBtn = within(dialog).getByRole('button', { name: 'Delete Switches' })

    fireEvent.click(deleteBtn)

    await waitFor(async () => expect(callback).toBeCalled())

    expect(dialog).not.toBeVisible()
  })

  it('showDeleteSwitch', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useSwitchActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { showDeleteSwitch } = result.current
    const callback = jest.fn()
    act(() => {
      showDeleteSwitch(switchList.data?.[0], tenantId, callback)
    })

    const dialog = await screen.findByRole('dialog')
    const deleteBtn = within(dialog).getByRole('button', { name: 'Delete Switch' })
    fireEvent.click(deleteBtn)

    await waitFor(async () => expect(callback).toBeCalled())
    expect(dialog).not.toBeVisible()
  })

  it('showRebootSwitch', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useSwitchActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { showRebootSwitch } = result.current
    act(() => {
      showRebootSwitch('switch-id', tenantId, false)
    })

    const dialog = await screen.findByRole('dialog')
    const rebootBtn = within(dialog).getByRole('button', { name: 'Reboot' })
    fireEvent.click(rebootBtn)

    await waitFor(async () => expect(dialog).not.toBeVisible())
  })

  it('showRebootSwitch - stack', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useSwitchActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { showRebootSwitch } = result.current
    act(() => {
      showRebootSwitch('switch-id', tenantId, true)
    })

    const dialog = await screen.findByRole('dialog')
    const rebootBtn = within(dialog).getByRole('button', { name: 'Reboot' })
    fireEvent.click(rebootBtn)

    await waitFor(async () => expect(dialog).not.toBeVisible())
  })

  it('doSyncData', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useSwitchActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { doSyncData } = result.current
    const callback = jest.fn()
    act(() => {
      doSyncData('switch-id', tenantId, callback)
    })
    // await waitFor(async () => expect(callback).toBeCalled())
  })

  it('doRetryFirmwareUpdate', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useSwitchActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { doRetryFirmwareUpdate } = result.current
    const callback = jest.fn()
    act(() => {
      doRetryFirmwareUpdate('switch-id', tenantId, callback)
    })

    await waitFor(async () => expect(callback).toBeCalled())
  })
})

describe('Handle error occurred', () => {

  beforeEach(() => {
    message.destroy()
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.reboot.url,
        (req, res, ctx) => res(ctx.status(404), ctx.json({}))
      ),
      rest.post(
        SwitchUrlsInfo.syncData.url,
        (req, res, ctx) => res(ctx.status(404), ctx.json({}))
      ),
      rest.post(
        SwitchUrlsInfo.retryFirmwareUpdate.url,
        (req, res, ctx) => res(ctx.status(404), ctx.json({}))
      )
    )
  })

  afterEach(() => {
    Modal.destroyAll()
    jest.clearAllMocks()
  })

  it('showRebootSwitch', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useSwitchActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { showRebootSwitch } = result.current
    act(() => {
      showRebootSwitch('switch-id', tenantId, false)
    })

    const dialog = await screen.findByRole('dialog')
    const rebootBtn = within(dialog).getByRole('button', { name: 'Reboot' })
    fireEvent.click(rebootBtn)

    await waitFor(async () => expect(dialog).not.toBeVisible())
  })

  it('doSyncData', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useSwitchActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { doSyncData } = result.current
    const callback = jest.fn()
    act(() => {
      doSyncData('switch-id', tenantId, callback)
    })
    expect(callback).not.toBeCalled()
  })

  it('doRetryFirmwareUpdate', async () => {

    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const { result } = renderHook(() => useSwitchActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { doRetryFirmwareUpdate } = result.current
    const callback = jest.fn()
    act(() => {
      doRetryFirmwareUpdate('switch-id', tenantId, callback)
    })

    expect(callback).not.toBeCalled()
  })
})
