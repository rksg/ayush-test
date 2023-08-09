import { initialize } from '@googlemaps/jest-mocks'
import userEvent      from '@testing-library/user-event'
import { Modal }      from 'antd'
import { rest }       from 'msw'

import { useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { apApi, venueApi }              from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }              from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  apGroupsList,
  getApGroup,
  venueDefaultApGroup,
  venuelist
} from '../../__tests__/fixtures'

import { ApGroupForm } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))


describe('AP Group Form - Add', () => {
  const params = { tenantId: 'tenant-id', action: 'add' }
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
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
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id' }))),
      rest.post(WifiUrlsInfo.addApGroup.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id' })))
    )

  })
  afterEach(() => {
    Modal.destroyAll()
  })
  it('should render correctly', async () => {
    render(<Provider><ApGroupForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/apgroups/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Add AP Group')).toBeVisible()
    expect(await screen.findByText('Group Member')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/wifi`,
      hash: '',
      search: ''
    })
  })

  it('should render breadcrumb correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<Provider><ApGroupForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/apgroups/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByRole('link', {
      name: /access points/i
    })).toBeTruthy()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider><ApGroupForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/apgroups/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Wi-Fi')).toBeVisible()
    expect(await screen.findByText('Access Points')).toBeVisible()
    expect(screen.getByRole('link', {
      name: /ap list/i
    })).toBeTruthy()
  })

  it('add ap group', async () => {
    render(<Provider><ApGroupForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/apgroups/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Add AP Group')).toBeVisible()
    expect(await screen.findByText('Group Member')).toBeVisible()

    fireEvent.change(screen.getByLabelText(/Group Name/), { target: { value: 'ap group' } })
    fireEvent.mouseDown(screen.getByLabelText(/Venue/))
    await userEvent.click(await screen.getAllByText('My-Venue')[0])
    await waitFor(() => screen.findByText(/for ap group 2/i))
    await userEvent.click(screen.getByText(/for ap group 2/i))
    await userEvent.click(screen.getByRole('button', {
      name: /right add/i
    }))
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/wifi`,
      hash: '',
      search: ''
    })
  })

  it('edit ap group', async () => {
    const params = { tenantId: 'tenant-id', apGroupId: 'apgroup-id', action: 'edit' }
    render(<Provider><ApGroupForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action' }
    })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Edit AP Group')).toBeVisible()
    await waitFor(() => screen.findByText(/for ap group 2/i))
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
  })
})
