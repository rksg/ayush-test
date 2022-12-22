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
      )
    )
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

    jest.clearAllMocks()
  })

})
