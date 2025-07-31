import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'
import { apApi, venueApi }        from '@acx-ui/rc/services'
import {
  ApDeep,
  APGeneralFixtures,
  CommonRbacUrlsInfo,
  CommonUrlsInfo,
  MdnsProxyUrls,
  SwitchRbacUrlsInfo,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import {
  apDetailsList,
  r650Cap,
  venueCaps,
  venueData,
  venueList
} from '../../__tests__/fixtures'

import { ApDataContext, ApEdit } from '.'

const { mockAPList } = APGeneralFixtures
const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('../ApForm', () => ({
  ApForm: () => <div data-testid='ApForm' />
}))

jest.mock('./RadioTab/RadioSettings/RadioSettings', () => ({
  RadioSettings: () => <div data-testid='RadioSettings' />
}))

describe('ApEditTabs', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.WIFI_RBAC_API)

    mockServer.use(
      rest.get(CommonRbacUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueList))),
      rest.get(WifiRbacUrlsInfo.getWifiCapabilities.url,
        (_, res, ctx) => res(ctx.json(venueCaps))),
      rest.get(WifiRbacUrlsInfo.getAp.url.replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(apDetailsList[0]))),
      rest.post(CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(mockAPList))),
      rest.get(
        WifiRbacUrlsInfo.getApCapabilities.url,
        (_, res, ctx) => res(ctx.json(r650Cap))
      ),
      rest.post(
        WifiRbacUrlsInfo.getApCompatibilities.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        MdnsProxyUrls.queryMdnsProxy.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        WifiRbacUrlsInfo.getApGroupsList.url,
        (_, res, ctx) => res(ctx.json({
          totalCount: 1, page: 1, data: [
            {
              id: '1724eda6f49e4223be36f864f46faba5',
              name: ''
            }
          ]
        }))
      ),
      rest.post(
        SwitchRbacUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json({ data: [], totalCount: 0 }))
      )
    )
  })

  const params = {
    tenantId: 'tenant-id',
    venueId: 'venue-id',
    serialNumber: 'serial-number',
    action: 'edit',
    activeTab: 'general'
  }

  it('should render correctly', async () => {
    render(<Provider>
      <ApDataContext.Provider value={{
        apData: apDetailsList[0] as unknown as ApDeep
      }}>
        <ApEdit />
      </ApDataContext.Provider>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/wifi/:serialNumber/:action/:activeTab'
      }
    })

    await screen.findByText('test ap')
    await waitFor(async () => {
      expect(await screen.findAllByRole('tab')).toHaveLength(5)
    })

    expect(await screen.findByTestId('ApForm')).toBeVisible()

    await userEvent.click(await screen.findByRole('tab', { name: 'Radio' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/wifi/${params.serialNumber}/edit/radio`,
      hash: '',
      search: ''
    })
  })
})
