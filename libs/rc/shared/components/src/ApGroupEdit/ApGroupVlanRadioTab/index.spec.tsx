import { rest } from 'msw'

import { apApi, networkApi }                        from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider, store }                          from '@acx-ui/store'
import { act, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { apGroupMembers, apGroupNetworkLinks, networkApGroup, networkDeepList, oneApGroupList, vlanPoolList } from '../__tests__/fixtures'
import { ApGroupEditContext }                                                                                 from '../context'

import { ApGroupVlanRadioTab } from './index'


const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./ApGroupVlanRadioTable', () => ({
  ApGroupVlanRadioTable: () => <div data-testid={'apGroupVlanRadioTable'}></div>
}))

const mockGetNetworkDeep = jest.fn()
const setEditContextDataFn = jest.fn()
const venueId = oneApGroupList.data[0].venueId
const defaultApGroupCxtdata = {
  isEditMode: true,
  isRbacEnabled: false,
  venueId,
  setEditContextData: setEditContextDataFn
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
  })
})
