import { initialize } from '@googlemaps/jest-mocks'
import userEvent      from '@testing-library/user-event'
import { rest }       from 'msw'

import { useIsSplitOn }    from '@acx-ui/feature-toggle'
import { apApi, venueApi } from '@acx-ui/rc/services'
import {
  CommonRbacUrlsInfo,
  CommonUrlsInfo,
  SwitchRbacUrlsInfo,
  SwitchUrlsInfo,
  WifiRbacUrlsInfo,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }    from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  apGroupdeviceAps,
  apGroupsList,
  getApGroup,
  venueDefaultApGroup,
  venuelist
} from '../__tests__/fixtures'
import { ApGroupEditContext } from '../context'


import { ApGroupGeneralTab } from './index'

const setEditContextDataFn = jest.fn()
const mockedUsedNavigate = jest.fn()
const mockedUpdateApGroupReq = jest.fn()
const mockedGetApListReq = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const venueId = venuelist.data[0].id
const defaultApGroupCxtdata = {
  isEditMode: false,
  isApGroupTableFlag: false,
  isWifiRbacEnabled: false,
  venueId,
  setEditContextData: setEditContextDataFn
}

describe('AP Group General tab for edit mode', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockedUsedNavigate.mockReset()
    setEditContextDataFn.mockReset()
    mockedUpdateApGroupReq.mockReset()
    initialize()

    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuelist))),
      rest.get(WifiUrlsInfo.getVenueDefaultApGroup.url,
        (_, res, ctx) => res(ctx.json(venueDefaultApGroup))),
      rest.post(WifiUrlsInfo.getApGroupsList.url,
        (_, res, ctx) => res(ctx.json(apGroupsList))),
      rest.get(WifiUrlsInfo.getApGroup.url,
        (_, res, ctx) => res(ctx.json(getApGroup))),
      rest.put(WifiUrlsInfo.updateApGroup.url,
        (_, res, ctx) => {
          mockedUpdateApGroupReq()
          return res(ctx.json({ requestId: 'request-id' }))
        }),
      rest.post(WifiUrlsInfo.addApGroup.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id' }))),
      rest.post(CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => {
          mockedGetApListReq()
          return res(ctx.json(apGroupdeviceAps))
        }),
      rest.post(SwitchRbacUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json([]))
      ),
      rest.post(SwitchUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json([]))
      ),
      rest.post(SwitchRbacUrlsInfo.getSwitchClientDetail.url,
        (_, res, ctx) => res(ctx.json([]))
      ),
      rest.post(SwitchUrlsInfo.getSwitchClientDetail.url,
        (_, res, ctx) => res(ctx.json([]))
      ),
      rest.get(WifiRbacUrlsInfo.getWifiCapabilities.url,
        (_, res, ctx) => res(ctx.json({})))
    )

  })

  it('edit ap group', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    const params = { tenantId: 'tenant-id', apGroupId: 'apgroup-id', action: 'edit' }
    render(
      <Provider>
        <ApGroupEditContext.Provider value={{
          ...defaultApGroupCxtdata,
          isEditMode: true, isApGroupTableFlag: true
        }}>
          <ApGroupGeneralTab />
        </ApGroupEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/general' }
      })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    await waitFor(() => screen.findByText(/for ap group 2/i))
    await userEvent.click(screen.getByText(/for ap group 2/i))
    await userEvent.click(screen.getByRole('button', { name: /right add/i }))
    const nameInput = screen.getByRole('textbox', { name: /Group Name/ })
    await userEvent.type(nameInput, 'test')
    const saveButton = screen.getByRole('button', { name: 'Apply' })
    await userEvent.click(saveButton)
    await waitFor(() => expect(mockedUpdateApGroupReq).toBeCalled())
    expect(saveButton).toBeVisible()
  })
})

describe('AP Group General tab', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockedUsedNavigate.mockReset()
    setEditContextDataFn.mockReset()
    mockedUpdateApGroupReq.mockReset()
    initialize()

    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuelist))),
      rest.get(WifiUrlsInfo.getVenueDefaultApGroup.url,
        (_, res, ctx) => res(ctx.json(venueDefaultApGroup))),
      rest.post(WifiUrlsInfo.getApGroupsList.url,
        (_, res, ctx) => res(ctx.json(apGroupsList))),
      rest.get(WifiUrlsInfo.getApGroup.url,
        (_, res, ctx) => res(ctx.json(getApGroup))),
      rest.put(WifiUrlsInfo.updateApGroup.url,
        (_, res, ctx) => {
          mockedUpdateApGroupReq()
          return res(ctx.json({ requestId: 'request-id' }))
        }),
      rest.post(WifiUrlsInfo.addApGroup.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id' }))),
      rest.post(CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => {
          mockedGetApListReq()
          return res(ctx.json(apGroupdeviceAps))
        }),
      rest.post(SwitchRbacUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json([]))
      ),
      rest.post(SwitchUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json([]))
      ),
      rest.post(SwitchRbacUrlsInfo.getSwitchClientDetail.url,
        (_, res, ctx) => res(ctx.json([]))
      ),
      rest.post(SwitchUrlsInfo.getSwitchClientDetail.url,
        (_, res, ctx) => res(ctx.json([]))
      ),
      rest.get(WifiRbacUrlsInfo.getWifiCapabilities.url,
        (_, res, ctx) => res(ctx.json({})))
    )

  })

  it('should render correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    const params = { tenantId: 'tenant-id', action: 'add' }

    render(<Provider>
      <ApGroupEditContext.Provider value={defaultApGroupCxtdata}>
        <ApGroupGeneralTab />
      </ApGroupEditContext.Provider>
    </Provider>, {
      route: { params, path: '/:tenantId/t/devices/apgroups/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Group Member')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/wifi`,
      hash: '',
      search: ''
    })
  })

  it('add ap group', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    const params = { tenantId: 'tenant-id', action: 'add' }
    render(<Provider>
      <ApGroupEditContext.Provider value={defaultApGroupCxtdata}>
        <ApGroupGeneralTab />
      </ApGroupEditContext.Provider>
    </Provider>, {
      route: { params, path: '/:tenantId/t/devices/apgroups/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Group Member')).toBeVisible()

    fireEvent.change(screen.getByLabelText(/Group Name/), { target: { value: 'ap group' } })
    fireEvent.mouseDown(screen.getByLabelText(/Venue/))
    await userEvent.click(await screen.getAllByText('My-Venue')[0])
    await waitFor(() => screen.findByText(/for ap group 2/i))
    await userEvent.click(screen.getByText(/for ap group 2/i))
    await userEvent.click(screen.getByRole('button', { name: /right add/i }))

    const saveButton = await screen.findByRole('button', { name: 'Add' })
    expect(saveButton).toBeVisible()
    await userEvent.click(saveButton)
    await waitFor(() => {
      // eslint-disable-next-line max-len
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/tenant-id/t/devices/wifi', { replace: true })
    })
  })
})



