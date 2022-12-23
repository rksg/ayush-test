import { initialize } from '@googlemaps/jest-mocks'
import userEvent      from '@testing-library/user-event'
import { Modal }      from 'antd'
import { rest }       from 'msw'

import { apApi, venueApi }                              from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                              from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  venuelist,
  venueCaps,
  aplist,
  apGrouplist,
  successResponse,
  apDetailsList
} from '../../__tests__/fixtures'

import { StackForm } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

async function fillInForm () {
  fireEvent.change(screen.getByLabelText(/Stack Name/), { target: { value: 'test stack' } })
  fireEvent.change(screen.getByLabelText(/Description/), { target: { value: 'test description' } })
  fireEvent.change(screen.getByTestId(/serialNumber1/), { target: { value: 'FEK4124R20X' } })
  fireEvent.change(screen.getByTestId(/serialNumber2/), { target: { value: 'FEK4124R21X' } })
  fireEvent.change(screen.getByTestId(/serialNumber3/), { target: { value: 'FEK4124R22X' } })
}

async function changeVenue () {
  expect(await screen.findByText('Select venue...')).toBeVisible()

  fireEvent.mouseDown(await screen.findByLabelText(/Venue/))
  await userEvent.click(screen.getAllByText('My-Venue')[0])
}

describe('Switch Stack Form - Add', () => {
  const params = { tenantId: 'tenant-id', action: 'add' }
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    initialize()
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuelist))),
      rest.get(CommonUrlsInfo.getApGroupList.url,
        (_, res, ctx) => res(ctx.json(apGrouplist))),
      rest.post(SwitchUrlsInfo.addSwitch.url,
        (_, res, ctx) => res(ctx.json(successResponse)))
    )
  })
  afterEach(() => {
    Modal.destroyAll()
  })
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/add' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
    expect(await screen.findByText('Add Switch Stack')).toBeVisible()
    expect(await screen.findByText('Select venue...')).toBeVisible()

    await changeVenue()
    await fillInForm()

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })
  it('should save stack without name and description correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/add' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    await changeVenue()
    await fillInForm()

    fireEvent.change(screen.getByLabelText(/Stack Name/), { target: { value: 'test stack' } })
    fireEvent.change(screen.getByLabelText(/Description/),
      { target: { value: 'test description' } })

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })
  it('should add row and delete row correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/add' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Add another member' }))
    await userEvent.click(await screen.findByTestId('deleteBtn4'))

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/devices/switch`,
      hash: '',
      search: ''
    })
  })
  it('should trigger switch serial number validation 1 correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/add' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    await changeVenue()
    await fillInForm()

    fireEvent.change(screen.getByTestId(/serialNumber3/), { target: { value: 'FEK4124R20X' } })
    screen.getByTestId(/serialNumber3/).focus()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    await screen.findByText(/Serial number is invalid/)
  })
  it('should trigger switch serial number validation 2 correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/add' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    await changeVenue()
    await fillInForm()

    fireEvent.change(screen.getByTestId(/serialNumber3/), { target: { value: 'FMG4124R20X' } })
    screen.getByTestId(/serialNumber3/).focus()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    await screen.findByText(/Serial number is invalid/)
  })
  it('should trigger switch serial number validation 3 correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/add' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    await changeVenue()
    await fillInForm()

    fireEvent.change(screen.getByTestId(/serialNumber3/), { target: { value: 'AAA' } })
    screen.getByTestId(/serialNumber3/).focus()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    await screen.findByText(/Serial number is invalid/)
  })
  it('should show disabled delete button correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/add' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    await userEvent.click(await screen.findByTestId('deleteBtn1'))
    await userEvent.click(await screen.findByTestId('deleteBtn2'))

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/devices/switch`,
      hash: '',
      search: ''
    })
  })
  it('should trigger radio onchange correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/add' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    await userEvent.click(await screen.findByTestId('active2'))

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/devices/switch`,
      hash: '',
      search: ''
    })
  })
  it('should render empty venue list correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/add' }
    })
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json([])))
    )

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
  })
})
