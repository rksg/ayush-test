import { initialize } from '@googlemaps/jest-mocks'
import userEvent      from '@testing-library/user-event'
import { Modal }      from 'antd'
import { debounce }   from 'lodash'
import { rest }       from 'msw'
import { act }        from 'react-dom/test-utils'

import { useIsSplitOn }                   from '@acx-ui/feature-toggle'
import { apApi, switchApi, venueApi }     from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  venuelist,
  apGrouplist,
  successResponse,
  editStackData,
  editStackDetail,
  editStackMembers,
  standaloneSwitches
} from '../__tests__/fixtures'
import {
  vlansByVenueListResponse
} from '../SwitchForm/__tests__/fixtures'

import { StackForm } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

async function fillInForm () {
  const stackNameInput = await screen.findByLabelText(/Stack Name/)
  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => {
    fireEvent.change(stackNameInput, { target: { value: '' } })
    fireEvent.change(stackNameInput, { target: { value: 'test stack' } })
    fireEvent.change(await screen.findByLabelText(/Description/),
      { target: { value: 'test description' } })
    fireEvent.change(
      await screen.findByTestId(/serialNumber1/), { target: { value: 'FMK4124R20X' } })
    fireEvent.change(
      await screen.findByTestId(/serialNumber2/), { target: { value: 'FMK4124R21X' } })
    screen.getByTestId(/serialNumber1/i).focus()
    screen.getByTestId(/serialNumber1/i).blur()
  })
}

async function changeVenue () {
  fireEvent.mouseDown(await screen.findByLabelText(/Venue/))
  const venue = await screen.findAllByText('My-Venue')
  await userEvent.click(venue[0])
}

describe('Switch Stack Form - Add', () => {
  const params = { tenantId: 'tenant-id', switchId: 'switch-id', action: 'add' }
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(switchApi.util.resetApiState())
    initialize()
    mockServer.use(
      rest.get(CommonUrlsInfo.getApGroupList.url,
        (_, res, ctx) => res(ctx.json(apGrouplist))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuelist))),
      rest.get(SwitchUrlsInfo.getSwitch.url,
        (_, res, ctx) => res(ctx.json(editStackData))),
      rest.post(SwitchUrlsInfo.addSwitch.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(SwitchUrlsInfo.getVlansByVenue.url,
        (_, res, ctx) => res(ctx.json(vlansByVenueListResponse))),
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(editStackDetail))),
      rest.post(SwitchUrlsInfo.getSwitchList.url,
        (_, res, ctx) => res(ctx.json({ data: standaloneSwitches }))),
      rest.post(SwitchUrlsInfo.convertToStack.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })
  afterEach(() => {
    Modal.destroyAll()
  })
  it('should render correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/stack/:action' }
    })
    await waitFor(async () => {
      expect(await screen.findByText('Add Switch Stack')).toBeVisible()
    })

    await changeVenue()
    await fillInForm()

    const addButton = await screen.findByRole('button', { name: 'Add' })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(addButton)
    })
  })
  it('should save stack without name and description correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/stack/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    await changeVenue()
    await fillInForm()

    fireEvent.change(await screen.findByLabelText(/Stack Name/),
      { target: { value: 'test stack' } })
    fireEvent.change(await screen.findByLabelText(/Description/),
      { target: { value: 'test description' } })

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })
  it('should add row and delete row correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/stack/:action' }
    })

    await waitFor(async () => {
      expect(await screen.findByText('Add Switch Stack')).toBeVisible()
    })

    await userEvent.click(await screen.findByTestId('deleteBtn2'))
    await userEvent.click(await screen.findByRole('button', { name: 'Add another member' }))
    await fillInForm()

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/switch`,
      hash: '',
      search: ''
    })
  })
  it('should trigger switch serial number validation 1 correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/stack/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    await changeVenue()
    await fillInForm()

    const serialNumber1 = await screen.findByTestId(/serialNumber1/)
    const serialNumber2 = await screen.findByTestId(/serialNumber2/)

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.change(serialNumber1, { target: { value: 'FEK4124R21X' } })
      fireEvent.change(serialNumber2, { target: { value: 'FEK4124R21X' } })
      serialNumber2.focus()
      serialNumber2.blur()
    })
  })
  it('should show disabled delete button correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/stack/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    await userEvent.click(await screen.findByTestId('deleteBtn1'))
    await userEvent.click(await screen.findByTestId('deleteBtn2'))

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/switch`,
      hash: '',
      search: ''
    })
  })
  it('should trigger radio onchange correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/stack/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    await userEvent.click(await screen.findByTestId('active2'))

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/switch`,
      hash: '',
      search: ''
    })
  })
  it('should render empty venue list correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/stack/:action' }
    })
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json([])))
    )

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
  })
  it('should handle add stack by stack switches', async () => {
    const params = { tenantId: 'tenant-id', switchId: 'switch-id', action: 'add' ,
      venueId: 'venue-id', stackList: 'FEK3224R07X_FEK3224R08X'
    }
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/stack/:venueId/:stackList/:action' }
    })

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
    })

    expect(await screen.findByText('FEK3224R07X')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it('should handle error occurred for stack switches', async () => {
    const params = { tenantId: 'tenant-id', switchId: 'switch-id', action: 'add' ,
      venueId: 'switch-id', stackList: 'FEK3224R07X_FEK3224R08X'
    }
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/stack/:venueId/:stackList/:action' }
    })

    mockServer.use(
      rest.post(SwitchUrlsInfo.convertToStack.url,
        (_, res, ctx) => res(ctx.status(404), ctx.json({})))
    )

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
    })

    expect(await screen.findByText('FEK3224R07X')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    // TODO
    // expect(await screen.findByText('Server Error')).toBeVisible()
  })

  it('should render correct breadcrumb when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/stack/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Add Switch Stack')).toBeVisible()

    await changeVenue()
    await fillInForm()

    expect(screen.getByRole('link', {
      name: /switches/i
    })).toBeTruthy()
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it('should render correct breadcrumb when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/stack/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Add Switch Stack')).toBeVisible()

    await changeVenue()
    await fillInForm()

    expect(await screen.findByText('Wired')).toBeVisible()
    expect(await screen.findByText('Switches')).toBeVisible()
    expect(screen.getByRole('link', {
      name: /switch list/i
    })).toBeTruthy()
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })
})

describe('Switch Stack Form - Edit', () => {
  const params = { tenantId: 'tenant-id', switchId: 'FEK4124R28X', action: 'edit' }
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    initialize()
    mockServer.use(
      rest.get(CommonUrlsInfo.getApGroupList.url,
        (_, res, ctx) => res(ctx.json(apGrouplist))),
      rest.get(SwitchUrlsInfo.getSwitch.url,
        (_, res, ctx) => res(ctx.json(editStackData))),
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(editStackDetail))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuelist))),
      rest.post(SwitchUrlsInfo.addSwitch.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.post(SwitchUrlsInfo.getMemberList.url,
        (_, res, ctx) => res(ctx.json(editStackMembers))),
      rest.put(SwitchUrlsInfo.updateSwitch.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id' })))
    )
  })
  afterEach(() => {
    Modal.destroyAll()
  })
  it('should render edit stack form correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/stack/:switchId/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'FEK4124R28X' })).toBeVisible()
  })
  it('should submit edit stack form correctly', async () => {
    // TODO:
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/stack/:switchId/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'FEK4124R28X' })).toBeVisible()

    const src = await screen.findByTestId('1_Icon')

    const dst = await screen.findByTestId('dropContainer')
    fireEvent.mouseDown(src)
    fireEvent.mouseMove(dst)
    debounce(() => {
      fireEvent.mouseUp(dst)
    }, 100)
  })
  it('should render edit stack form with real module correctly', async () => {
    editStackDetail.model = 'ICX7650-C12P'
    editStackDetail.rearModule = 'stack-40g'
    editStackDetail.ipFullContentParsed = false
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(editStackDetail)))
    )
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/stack/:switchId/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'FEK4124R28X' })).toBeVisible()

    const applyButton = await screen.findByRole('button', { name: /apply/i })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(applyButton)
    })
  })
  it('should render edit stack form with readonly mode correctly', async () => {
    editStackDetail.cliApplied = true
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(editStackDetail)))
    )
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/stack/:switchId/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'FEK4124R28X' })).toBeVisible()

    const applyButton = await screen.findByRole('button', { name: /apply/i })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(applyButton)
    })
  })


})
