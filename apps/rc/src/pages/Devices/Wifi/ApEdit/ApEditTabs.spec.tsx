import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                                      from '@acx-ui/feature-toggle'
import { apApi, venueApi, transformRbacApList }                                              from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo, CommonUrlsInfo, MdnsProxyUrls, WifiRbacUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                   from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import {
  apDetailsList,
  deviceAps,
  r650Cap,
  venueData
} from '../../__tests__/fixtures'

import { ApEdit } from '.'

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
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    mockServer.use(
      rest.get(CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(WifiRbacUrlsInfo.getAp.url.replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(apDetailsList[0]))),
      rest.post(CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(deviceAps))),
      rest.get(WifiUrlsInfo.getApCapabilities.url,
        (_, res, ctx) => res(ctx.json(r650Cap))),

      // rbac
      rest.post(CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(transformRbacApList(deviceAps)))),
      rest.get(
        WifiRbacUrlsInfo.getApCapabilities.url,
        (_, res, ctx) => res(ctx.json(r650Cap))
      ),
      rest.post(
        MdnsProxyUrls.getMdnsProxyListRbac.url,
        (_, res, ctx) => res(ctx.json({}))
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
    render(<Provider><ApEdit /></Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/wifi/:serialNumber/:action/:activeTab'
      }
    })

    await screen.findByRole('heading', { name: 'test ap', level: 1 })
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
