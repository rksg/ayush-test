import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { apApi, networkApi }                                from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo }                     from '@acx-ui/rc/utils'
import { Provider, store }                                  from '@acx-ui/store'
import { act, mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { apGroupMembers, apGroupNetworkLinks, networkApGroup, networkDeepList, oneApGroupList, vlanPoolList } from '../__tests__/fixtures'
import { ApGroupEditContext }                                                                                 from '../context'

import { ApGroupVlanRadioTab } from './index'


const mockedUsedNavigate = jest.fn()
const mockedUpdateNetworkVenueFn = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const mockGetNetworkDeep = jest.fn()
const setEditContextDataFn = jest.fn()
const venueId = oneApGroupList.data[0].venueId
const defaultApGroupCxtdata = {
  isEditMode: true,
  isRbacEnabled: false,
  venueId,
  setEditContextData: setEditContextDataFn,
  editContextData: {},
  editRadioContextData: {},
  setEditRadioContextData: jest.fn(),
  previousPath: '',
  setPreviousPath: jest.fn(),
  apGroupDetails: undefined,
  apGroupApCaps: undefined
}
describe('AP Group vlan & radio tab', () => {

  beforeEach(() => {
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
      store.dispatch(apApi.util.resetApiState())
    })

    mockServer.use(
      rest.post(
        WifiUrlsInfo.getApGroupsList.url,
        (req, res, ctx) => res(ctx.json(oneApGroupList))
      ),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(apGroupMembers))
      ),
      rest.post(
        CommonUrlsInfo.getApGroupNetworkList.url,
        (req, res, ctx) => res(ctx.json(apGroupNetworkLinks))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(networkApGroup))
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (req, res, ctx) => res(ctx.json(networkApGroup))
      ),
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => {
          mockGetNetworkDeep()
          return res(ctx.json(networkDeepList.response))
        }
      ),
      rest.get(
        WifiUrlsInfo.getVlanPools.url,
        (req, res, ctx) => res(ctx.json([...vlanPoolList]))
      ),
      rest.post(
        WifiUrlsInfo.getVlanPoolViewModelList.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.put(
        WifiUrlsInfo.updateNetworkVenues.url,
        (req, res, ctx) => {
          mockedUpdateNetworkVenueFn()
          return res(ctx.json({}))
        }
      )
    )
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      apGroupId: '58195e050b8a4770acc320f6233ad8d9',
      action: 'edit',
      activeTab: 'vlanRadio'
    }

    render(
      <Provider>
        <ApGroupEditContext.Provider value={defaultApGroupCxtdata} >
          <ApGroupVlanRadioTab />
        </ApGroupEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      }
    )

    await waitFor(() => expect(mockGetNetworkDeep).toBeCalledTimes(1))
    // eslint-disable-next-line max-len
    const note = await screen.findByText('Configure the VLAN & Radio settings for the following networks which are applied to this AP group:')
    expect(note).toBeVisible()

    expect(await screen.findByText('joe-psk')).toBeVisible()
  })

  // eslint-disable-next-line max-len
  it('should open drawer and submit changes when selecting first row and clicking edit', async () => {
    const params = {
      tenantId: 'tenant-id',
      apGroupId: '58195e050b8a4770acc320f6233ad8d9',
      action: 'edit',
      activeTab: 'vlanRadio'
    }

    const contextData = {
      ...defaultApGroupCxtdata,
      editContextData: {},
      editRadioContextData: {},
      setEditRadioContextData: jest.fn(),
      previousPath: '',
      apGroupDetails: undefined,
      apGroupApCaps: undefined
    }

    render(
      <Provider>
        <ApGroupEditContext.Provider value={contextData}>
          <ApGroupVlanRadioTab />
        </ApGroupEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      }
    )

    await waitFor(() => expect(mockGetNetworkDeep).toBeCalled())

    // eslint-disable-next-line max-len
    const note = await screen.findByText('Configure the VLAN & Radio settings for the following networks which are applied to this AP group:')
    expect(note).toBeVisible()

    expect(await screen.findByText('joe-psk')).toBeVisible()

    const targetRow1 = screen.getByRole('row', { name: new RegExp('joe-psk') })
    await userEvent.click(within(targetRow1).getByRole('radio'))
    expect(targetRow1).toBeInTheDocument()

    await userEvent.click(targetRow1)

    const editButton = await screen.findByRole('button', { name: /edit/i })
    expect(editButton).toBeInTheDocument()
    await userEvent.click(editButton)

    const drawerTitle = await screen.findByText('Edit VLAN & Radio')
    expect(drawerTitle).toBeInTheDocument()

    const vlanIdInput = await screen.findByRole('spinbutton', { name: /VLANs/ })
    expect(vlanIdInput).toBeVisible()
    await userEvent.type(vlanIdInput, '2')

    const okButton = await screen.findByRole('button', { name: /ok/i })
    expect(okButton).toBeInTheDocument()
    await userEvent.click(okButton)

    const applyButton = await screen.findByRole('button', { name: /apply/i })
    expect(applyButton).toBeInTheDocument()
    await userEvent.click(applyButton)

    expect(mockedUpdateNetworkVenueFn).toBeCalled()
  })
})
