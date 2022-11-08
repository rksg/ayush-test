import { initialize } from '@googlemaps/jest-mocks'
import userEvent      from '@testing-library/user-event'
import { Modal }      from 'antd'
import { rest }       from 'msw'

import { apApi, venueApi }              from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }              from '@acx-ui/store'
import {
  act,
  mockServer,
  render,
  screen,
  fireEvent,
  within,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  venuelist,
  venueCaps,
  aplist,
  apGrouplist,
  successResponse
} from '../__tests__/fixtures'

import { ApGroupForm } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))


describe('AP Form - Add', () => {
  const params = { tenantId: 'tenant-id', action: 'add' }
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    initialize()

    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuelist)))
    )

    mockServer.use(
      rest.post(WifiUrlsInfo.getApGroupsList.url,
        (_, res, ctx) => res(ctx.json(venuelist)))
    )

    // getVenueDefaultApGroup
  })
  afterEach(() => {
    Modal.destroyAll()
  })
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><ApGroupForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/apgroups/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
    expect(await screen.findByText('Add AP Group')).toBeVisible()
    expect(await screen.findByText('Select venue...')).toBeVisible()
    expect(await screen.findByText('Group Member')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/devices/aps`,
      hash: '',
      search: ''
    })
  })

})
