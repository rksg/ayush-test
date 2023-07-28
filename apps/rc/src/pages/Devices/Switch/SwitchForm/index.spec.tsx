import { initialize } from '@googlemaps/jest-mocks'
import userEvent      from '@testing-library/user-event'
import { rest }       from 'msw'
import { act }        from 'react-dom/test-utils'

import { venueApi }                       from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved,
  waitFor
} from '@acx-ui/test-utils'

import { staticRoutes } from '../__tests__/fixtures'

import { swtichListResponse, venueListResponse, vlansByVenueListResponse, switchResponse, switchDetailHeader } from './__tests__/fixtures'

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
        (_, res, ctx) => res(ctx.status(200), ctx.json({ requestId: 'request-id' }))),
      rest.post(SwitchUrlsInfo.addStackMember.url,
        (_, res, ctx) => res(ctx.status(200), ctx.json({ requestId: 'request-id' })))
    )
  })

  it('should render correctly', async () => {
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/:action' }
    })
    expect(await screen.findByText(/add switch/i)).toBeVisible()
  })

  it('should render switch breadcrumb correctly', async () => {
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/:action' }
    })
    expect(await screen.findByText('Wired')).toBeVisible()
    expect(await screen.findByText('Switches')).toBeVisible()
    expect(screen.getByRole('link', {
      name: /switch list/i
    })).toBeTruthy()
  })

  it('should add standalone switch correctly', async () => {
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/:action' }
    })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/add switch/i)).toBeVisible()
    fireEvent.mouseDown(await screen.findByLabelText(/Venue/))
    const venue = await screen.findAllByText('My-Venue')
    await userEvent.click(venue[0])
    const serialNumber = await screen.findByLabelText(/serial number/i)
    const switchNameInput = await screen.findByLabelText(/switch name/i)
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.change(
        serialNumber, { target: { value: 'FMF3250Q06L' } })
      fireEvent.change(
        switchNameInput, { target: { value: 'Switch Name' } })
    })
    fireEvent.change(
      await screen.findByLabelText(/description/i), { target: { value: 'Description' } })
    fireEvent.mouseDown(await screen.findByLabelText(/standalone switch/i))
    const addButton = await screen.findByRole('button', { name: /add/i })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(addButton)
    })
    expect(await screen.findByRole('heading', { name: /switch/i } )).toBeVisible()
  })

  it('should add stack member correctly', async () => {
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/:action' }
    })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/add switch/i)).toBeVisible()
    fireEvent.mouseDown(await screen.findByLabelText(/Venue/))
    const venue = await screen.findAllByText('My-Venue')
    await userEvent.click(venue[0])
    const serialNumber = await screen.findByLabelText(/serial number/i)
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.change(serialNumber, { target: { value: 'FEK3231S0A0' } })
      serialNumber.focus()
    })
    const switchNameInput = await screen.findByLabelText(/switch name/i)
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.change(
        switchNameInput, { target: { value: 'Switch Name' } })
    })
    await userEvent.click(await screen.findByText(/member in stack/i))

    await screen.findByText('7150stack')

    const addButton = await screen.findByRole('button', { name: /add/i })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(addButton)
    })
    expect(await screen.findByRole('heading', { name: /switch/i } )).toBeVisible()
  })

  it('should cancel chanage correctly', async () => {
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/:action' }
    })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/add switch/i)).toBeVisible()

    const serialNumberInput = await screen.findByLabelText(/serial number/i)
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.change(
        serialNumberInput, { target: { value: 'invalid' } })
    })
    await userEvent.click(await screen.findByRole('button', { name: /add/i }))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).lastCalledWith('/tenant-id/t/devices/switch')
  })

  it('should handle error for add standalone switch correctly', async () => {
    mockServer.use(
      rest.post(SwitchUrlsInfo.addSwitch.url,
        (_, res, ctx) => {
          return res(ctx.status(400))
        })
    )
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/:action' }
    })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/add switch/i)).toBeVisible()
    fireEvent.mouseDown(await screen.findByLabelText(/Venue/))
    const venue = await screen.findAllByText('My-Venue')
    await userEvent.click(venue[0])
    const serialNumberInput = await screen.findByLabelText(/serial number/i)
    const switchNameInput = await screen.findByLabelText(/switch name/i)
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.change(
        serialNumberInput, { target: { value: 'FMF3250Q06L' } })
      fireEvent.change(
        switchNameInput, { target: { value: 'Switch Name' } })
    })
    fireEvent.change(
      await screen.findByLabelText(/description/i), { target: { value: 'Description' } })
    fireEvent.mouseDown(await screen.findByLabelText(/standalone switch/i))
    const addButton = await screen.findByRole('button', { name: /add/i })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(addButton)
    })
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
      route: { params, path: '/:tenantId/t/devices/switch/:action' }
    })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/add switch/i)).toBeVisible()
    fireEvent.mouseDown(await screen.findByLabelText(/Venue/))
    const venue = await screen.findAllByText('My-Venue')
    await userEvent.click(venue[0])
    const serialNumberInput1 = await screen.findByLabelText(/serial number/i)
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.change(
        serialNumberInput1, { target: { value: 'FEK3231S0A0' } })
    })
    const serialNumber = await screen.findByLabelText(/serial number/i)
    const switchNameInput2 = await screen.findByLabelText(/switch name/i)
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      serialNumber.focus()
      fireEvent.change(
        switchNameInput2, { target: { value: 'Switch Name' } })
    })
    await userEvent.click(await screen.findByText(/member in stack/i))

    await screen.findByText('7150stack')

    const addButton = await screen.findByRole('button', { name: /add/i })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(addButton)
    })
    expect(await screen.findByRole('heading', { name: /switch/i } )).toBeVisible()
  })
})


describe('Edit switch form', () => {
  const params = {
    tenantId: 'tenant-id',
    switchId: 'switch-id',
    serialNumber: 'serial-number',
    action: 'edit'
  }
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    initialize()
    mockServer.use(
      rest.get(SwitchUrlsInfo.getVlansByVenue.url,
        (_, res, ctx) => res(ctx.json(vlansByVenueListResponse))),
      rest.get(SwitchUrlsInfo.getStaticRoutes.url,
        (_, res, ctx) => res(ctx.json(staticRoutes))),
      rest.get(SwitchUrlsInfo.getSwitch.url,
        (_, res, ctx) => res(ctx.json(switchResponse))),
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(switchDetailHeader))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.put(SwitchUrlsInfo.updateSwitch.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id' })))
    )
  })

  it('should render edit switch form correctly', async () => {
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/:action' }
    })
    expect(await screen.findByText(/ICX7150-C12 Router/i)).toBeVisible()
  })

  it('should render edit switch settings correctly', async () => {
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/:action' }
    })
    expect(await screen.findByText(/ICX7150-C12 Router/i)).toBeVisible()
  })

  it('should render edit switch with disabled ip settings correctly', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json({ ...switchDetailHeader, ipFullContentParsed: false })))
    )
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/:action' }
    })
    expect(await screen.findByText(/ICX7150-C12 Router/i)).toBeVisible()
  })

  it('should submit edit switch form correctly', async () => {
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/:action' }
    })

    const settingsTab = await screen.findByRole('tab', { name: 'Settings' })
    fireEvent.click(settingsTab)
    const ipModeRadio = await screen.findByRole('radio', { name: 'Static/Manual' })
    fireEvent.click(ipModeRadio)

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.change(
        await screen.findByLabelText('IP Address'), { target: { value: '192.168.1.71' } })
      fireEvent.change(
        await screen.findByLabelText('Subnet Mask'), { target: { value: '255.255.0.0' } })
      fireEvent.change(
        await screen.findByLabelText('Default Gateway'), { target: { value: '192.168.1.1' } })
    })
    fireEvent.click(
      await screen.findByRole('switch'))
    const jumboOkBtn = await screen.findByRole('button', { name: /ok/i })
    fireEvent.click(jumboOkBtn)
    const applyButton = await screen.findByRole('button', { name: /apply/i })

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(applyButton)
    })
  })

  it('should submit edit switch form with dynamic ip mode correctly', async () => {
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/:action' }
    })

    const settingsTab = await screen.findByRole('tab', { name: 'Settings' })
    await userEvent.click(settingsTab)
    const ipModeRadio = screen.getByRole('radio', { name: 'DHCP' })
    await userEvent.click(ipModeRadio)
    await waitFor(() => expect(screen.getByLabelText('Subnet Mask')).toBeDisabled())
    const applyButton = screen.getByRole('button', { name: /apply/i })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(applyButton)
    })
  })
})

