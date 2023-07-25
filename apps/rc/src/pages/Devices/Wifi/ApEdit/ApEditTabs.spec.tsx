import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { apApi, venueApi }              from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }              from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import {
  apDetailsList,
  deviceAps
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

describe('ApEditTabs', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(apDetailsList[0]))),
      rest.post(CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(deviceAps)))
    )
  })

  const params = {
    tenantId: 'tenant-id',
    venueId: 'venue-id',
    serialNumber: 'serial-number',
    action: 'edit',
    activeTab: 'details'
  }

  it('should render correctly', async () => {
    render(<Provider><ApEdit /></Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/wifi/:serialNumber/:action/:activeTab'
      }
    })

    await screen.findByRole('heading', { name: 'test ap', level: 1 })

    expect(await screen.findAllByRole('tab')).toHaveLength(2)
    expect(await screen.findByTestId('ApForm')).toBeVisible()

    await userEvent.click(await screen.findByRole('tab', { name: 'Settings' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/wifi/${params.serialNumber}/edit/settings/general`,
      hash: '',
      search: ''
    })
  })
})
