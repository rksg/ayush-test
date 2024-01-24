import { rest } from 'msw'

import { apApi, networkApi }                        from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider, store }                          from '@acx-ui/store'
import { act, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { ApGroupEditContext }                                                                                 from '..'
import { apGroupMembers, apGroupNetworkLinks, networkApGroup, networkDeepList, oneApGroupList, vlanPoolList } from '../../ApGroupDetails/__tests__/fixtures'

import { ApGroupVlanRadioTab } from '.'


const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./ApGroupVlanRadioTable', () => ({
  ApGroupVlanRadioTable: () => <div data-testid={'apGroupVlanRadioTable'}></div>
}))

const mockGetApGroup = jest.fn()
const setEditContextDataFn = jest.fn()

describe('AP Group vlan & radio tab', () => {

  beforeEach(() => {
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
      store.dispatch(apApi.util.resetApiState())
    })

    mockServer.use(
      rest.get(
        WifiUrlsInfo.getApGroup.url,
        (req, res, ctx) => {
          mockGetApGroup()
          return res(ctx.json({}))
        }
      ),
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
        CommonUrlsInfo.getNetworkDeepList.url,
        (req, res, ctx) => res(ctx.json(networkDeepList))
      ),
      rest.get(
        WifiUrlsInfo.getVlanPools.url,
        (req, res, ctx) => res(ctx.json([...vlanPoolList]))
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
        <ApGroupEditContext.Provider value={{
          isEditMode: true,
          isApGroupTableFlag: true,
          setEditContextData: setEditContextDataFn
        }} >
          <ApGroupVlanRadioTab />
        </ApGroupEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      }
    )

    await waitFor(() => expect(mockGetApGroup).toBeCalledTimes(1))
    // eslint-disable-next-line max-len
    const note = await screen.findByText('Configure the VLAN & Radio settings for the following networks which are applied to this AP group:')
    expect(note).toBeVisible()

  })

})