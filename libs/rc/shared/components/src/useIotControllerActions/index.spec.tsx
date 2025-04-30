import userEvent   from '@testing-library/user-event'
import { message } from 'antd'
import { rest }    from 'msw'
import '@testing-library/jest-dom'

import {
  useIsSplitOn
} from '@acx-ui/feature-toggle'
import {
  IotUrlsInfo, IotControllerStatus
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  renderHook,
  screen,
  within,
  waitFor
} from '@acx-ui/test-utils'

import { useIotControllerActions } from '.'

const tenantId = ':tenantId'

const iotControllerList = {
  requestId: '4cde2a1a-f916-4a19-bcac-869620d7f96f',
  response: {
    data: [{
      id: 'bbc41563473348d29a36b76e95c50381',
      name: 'ruckusdemos',
      inboundAddress: '192.168.1.1',
      serialNumber: 'rewqfdsafasd',
      publicAddress: 'ruckusdemos.cloud',
      publicPort: 443,
      apiKey: 'xxxxxxxxxxxxxxxxxxx',
      tenantId: '3f10af1401b44902a88723cb68c4bc77'
    }, {
      id: 'bbc41563473348d29a36b76e95c50382',
      name: 'iotController1',
      inboundAddress: '192.168.2.21',
      serialNumber: 'jfsdjoiasdfjo',
      publicAddress: 'iotController1.cloud',
      publicPort: 443,
      apiKey: 'xxxxxxxxxxxxxxxxxxx',
      tenantId: '3f10af1401b44902a88723cb68c4bc77'
    }] as IotControllerStatus[]
  }
}

describe('Test useIotControllerActions', () => {

  beforeEach(() => {
    message.destroy()
    mockServer.use(
      rest.delete(
        IotUrlsInfo.deleteIotController.url,
        (req, res, ctx) => res(ctx.json({ requestId: '4cde2a1a-f916-4a19-bcac-869620d7f96f' }))
      )
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('test iotController delete', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useIotControllerActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { deleteIotController } = result.current
    const callback = jest.fn()


    await deleteIotController([iotControllerList.response.data[0]], tenantId, callback)

    const dialog = await screen.findByRole('dialog')

    userEvent.type(within(dialog).getByRole('textbox',
      { name: 'Type the word "Delete" to confirm:' }), 'Delete')

    const deleteBtn = within(dialog).getByRole('button', { name: 'Delete Iot Controller' })

    await waitFor(() =>
      expect(deleteBtn).not.toBeDisabled())

    await userEvent.click(deleteBtn)

    await waitFor(async () => expect(callback).toBeCalled())

    expect(dialog).not.toBeVisible()
  })

})
