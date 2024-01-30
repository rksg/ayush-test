import userEvent   from '@testing-library/user-event'
import { message } from 'antd'
import { rest }    from 'msw'
import '@testing-library/jest-dom'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  CommonUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  renderHook,
  screen,
  within,
  waitFor
} from '@acx-ui/test-utils'

import { useRwgActions } from '.'

const tenantId = ':tenantId'

const rwgList = {
  requestId: '4cde2a1a-f916-4a19-bcac-869620d7f96f',
  response: [{
    rwgId: 'bbc41563473348d29a36b76e95c50381',
    tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
    venueId: '3f10af1401b44902a88723cb68c4bc77',
    venueName: 'My-Venue',
    name: 'ruckusdemos',
    loginUrl: 'https://rxgs5-vpoc.ruckusdemos.net',
    username: 'inigo',
    password: 'Inigo123!',
    status: 'Operational',
    id: 'bbc41563473348d29a36b76e95c50381',
    new: false
  }, {
    rwgId: 'bbc41563473348d29a36b76e95c50382',
    tenantId: '7b8cb9e8e99a4f42884ae9053604a377',
    venueId: '3f10af1401b44902a88723cb68c4bc77',
    venueName: 'My-Venue',
    name: 'rwg1',
    loginUrl: 'https://rxgs5-vpoc.ruckusdemos.net',
    username: 'inigo',
    password: 'Inigo123!',
    status: 'Offline',
    id: 'bbc41563473348d29a36b76e95c50382',
    new: false
  }]
}

describe('Test useRwgActions', () => {

  beforeEach(() => {
    message.destroy()
    mockServer.use(
      rest.delete(
        CommonUrlsInfo.deleteGateway.url,
        (req, res, ctx) => res(ctx.json({ requestId: '4cde2a1a-f916-4a19-bcac-869620d7f96f' }))
      ),
      rest.delete(
        CommonUrlsInfo.deleteGateways.url,
        (req, res, ctx) => res(ctx.json({ requestId: '4cde2a1a-f916-4a19-bcac-869620d7f96f' }))
      ))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('deleteGateways', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useRwgActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { deleteGateways } = result.current
    const callback = jest.fn()


    await deleteGateways(rwgList.response, tenantId, callback)

    const dialog = await screen.findByRole('dialog')

    userEvent.type(within(dialog).getByRole('textbox',
      { name: 'Type the word "Delete" to confirm:' }), 'Delete')

    const deleteBtn = within(dialog).getByRole('button', { name: 'Delete Gateways' })

    await waitFor(() =>
      expect(deleteBtn).not.toBeDisabled())

    await userEvent.click(deleteBtn)

    await waitFor(async () => expect(callback).toBeCalled())

    expect(dialog).not.toBeVisible()
  })

  it('test single gateway delete', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useRwgActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { deleteGateways } = result.current
    const callback = jest.fn()


    await deleteGateways([rwgList.response[0]], tenantId, callback)

    const dialog = await screen.findByRole('dialog')

    userEvent.type(within(dialog).getByRole('textbox',
      { name: 'Type the word "Delete" to confirm:' }), 'Delete')

    const deleteBtn = within(dialog).getByRole('button', { name: 'Delete Gateway' })

    await waitFor(() =>
      expect(deleteBtn).not.toBeDisabled())

    await userEvent.click(deleteBtn)

    await waitFor(async () => expect(callback).toBeCalled())

    expect(dialog).not.toBeVisible()
  })

})
