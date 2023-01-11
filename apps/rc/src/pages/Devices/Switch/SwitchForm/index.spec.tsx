import { initialize } from '@googlemaps/jest-mocks'
import userEvent      from '@testing-library/user-event'
import { rest }       from 'msw'

import { venueApi }                       from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { swtichListResponse, venueListResponse, vlansByVenueListResponse } from './__tests__/fixtures'

import { SwitchForm } from '.'

//switchListEmptyResponse
//vlansByVenueListEmptyResponse
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Add switch form', () => {
  const params = { tenantId: 'tenant-id', action: 'add' }
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    initialize()
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.post(SwitchUrlsInfo.getSwitchList.url,
        (_, res, ctx) => res(ctx.json(swtichListResponse))),
      rest.get(SwitchUrlsInfo.getVlansByVenue.url,
        (_, res, ctx) => res(ctx.json(vlansByVenueListResponse))),
      rest.post(SwitchUrlsInfo.addSwitch.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id' }))),
      rest.post(SwitchUrlsInfo.addStackMember.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id' }))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:action' }
    })
    expect(await screen.findByText(/add switch/i)).toBeVisible()
  })


  it('should add standalone switch correctly', async () => {
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:action' }
    })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/add switch/i)).toBeVisible()
    fireEvent.mouseDown(screen.getByLabelText(/Venue/))
    await userEvent.click(await screen.getAllByText('My-Venue')[0])
    fireEvent.change(screen.getByLabelText(/serial number/i), { target: { value: 'FMF3250Q06L' } })
    fireEvent.change(screen.getByLabelText(/switch name/i), { target: { value: 'Switch Name' } })
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Description' } })
    fireEvent.mouseDown(screen.getByLabelText(/standalone switch/i))
    await userEvent.click(await screen.findByRole('button', { name: /add/i }))
    expect(await screen.findByRole('heading', { name: /switch/i } )).toBeVisible()
  })

  it('should add stack member correctly', async () => {
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:action' }
    })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/add switch/i)).toBeVisible()
    fireEvent.mouseDown(screen.getByLabelText(/Venue/))
    await userEvent.click(await screen.getAllByText('My-Venue')[0])
    fireEvent.change(screen.getByLabelText(/serial number/i), { target: { value: 'FEK3231S0A0' } })
    screen.getByLabelText(/serial number/i).focus()
    fireEvent.change(screen.getByLabelText(/switch name/i), { target: { value: 'Switch Name' } })
    await userEvent.click(screen.getByText(/member in stack/i))

    await screen.findByText('7150stack')

    await userEvent.click(await screen.findByRole('button', { name: /add/i }))
    expect(await screen.findByRole('heading', { name: /switch/i } )).toBeVisible()
  })

  it('should cancel chanage correctly', async () => {
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:action' }
    })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/add switch/i)).toBeVisible()
    fireEvent.change(screen.getByLabelText(/serial number/i), { target: { value: 'invalid' } })
    await userEvent.click(await screen.findByRole('button', { name: /add/i }))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/devices/switch`,
      hash: '',
      search: ''
    })
  })

  it('should handle error for add standalone switch correctly', async () => {
    mockServer.use(
      rest.post(SwitchUrlsInfo.addSwitch.url,
        (_, res, ctx) => {
          return res(ctx.status(400))
        })
    )
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:action' }
    })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/add switch/i)).toBeVisible()
    fireEvent.mouseDown(screen.getByLabelText(/Venue/))
    await userEvent.click(await screen.getAllByText('My-Venue')[0])
    fireEvent.change(screen.getByLabelText(/serial number/i), { target: { value: 'FMF3250Q06L' } })
    fireEvent.change(screen.getByLabelText(/switch name/i), { target: { value: 'Switch Name' } })
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Description' } })
    fireEvent.mouseDown(screen.getByLabelText(/standalone switch/i))
    await userEvent.click(await screen.findByRole('button', { name: /add/i }))
    expect(await screen.findByRole('heading', { name: /switch/i } )).toBeVisible()
  })

  it('should handle error for add stack member correctly', async () => {

    mockServer.use(
      rest.post(SwitchUrlsInfo.addStackMember.url,
        (_, res, ctx) => {
          return res(ctx.status(400))
        })
    )
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:action' }
    })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/add switch/i)).toBeVisible()
    fireEvent.mouseDown(screen.getByLabelText(/Venue/))
    await userEvent.click(await screen.getAllByText('My-Venue')[0])
    fireEvent.change(screen.getByLabelText(/serial number/i), { target: { value: 'FEK3231S0A0' } })
    screen.getByLabelText(/serial number/i).focus()
    fireEvent.change(screen.getByLabelText(/switch name/i), { target: { value: 'Switch Name' } })
    await userEvent.click(screen.getByText(/member in stack/i))

    await screen.findByText('7150stack')

    await userEvent.click(await screen.findByRole('button', { name: /add/i }))
    expect(await screen.findByRole('heading', { name: /switch/i } )).toBeVisible()
  })
})

