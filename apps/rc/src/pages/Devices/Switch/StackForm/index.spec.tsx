import userEvent    from '@testing-library/user-event'
import { Modal }    from 'antd'
import { debounce } from 'lodash'
import { rest }     from 'msw'

import { useIsSplitOn }               from '@acx-ui/feature-toggle'
import { apApi, switchApi, venueApi } from '@acx-ui/rc/services'
import { CommonUrlsInfo,
  FirmwareUrlsInfo,
  SwitchUrlsInfo,
  SwitchFirmwareFixtures } from '@acx-ui/rc/utils'
import { Provider, store }    from '@acx-ui/store'
import {
  act,
  mockServer,
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  apGrouplist,
  successResponse,
  editStackData,
  editStackDetail,
  editStackMembers,
  standaloneSwitches,
  switchFirmwareVenue
} from '../__tests__/fixtures'
import {
  vlansByVenueListResponse
} from '../SwitchForm/__tests__/fixtures'

import { StackForm } from '.'

const { mockSwitchCurrentVersions } = SwitchFirmwareFixtures

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetSwitchCurrentVersionsQuery: () => ({
    data: mockSwitchCurrentVersions
  })
}))

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
      {children ? <><option value={undefined}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

async function fillInForm () {
  await userEvent.type(await screen.findByLabelText(/Stack Name/), 'test stack')
  await userEvent.type(await screen.findByLabelText(/Description/), 'test description')
  await userEvent.type(await screen.findByTestId(/serialNumber1/), 'FMK4124R20X')
  await userEvent.type(await screen.findByTestId(/serialNumber2/), 'FMK4124R21X')
}

async function changeVenue () {
  await userEvent.selectOptions(
    await screen.findByLabelText(/Venue/),
    await screen.findByRole('option', { name: /My-Venue/ })
  )
}

describe('Switch Stack Form - Add', () => {
  const params = { tenantId: 'tenant-id', switchId: 'switch-id', action: 'add' }
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.get(CommonUrlsInfo.getApGroupListByVenue.url,
        (_, res, ctx) => res(ctx.json(apGrouplist))),
      rest.post(FirmwareUrlsInfo.getSwitchVenueVersionList.url,
        (_, res, ctx) => res(ctx.json(switchFirmwareVenue))),
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
      route: { params, path: '/:tenantId/t/devices/switch/stack/:action' }
    })

    await changeVenue()
    await fillInForm()

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    expect(await screen.findByText('ICX7550-24')).toBeVisible()
  })
  it('should save stack without name and description correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/stack/:action' }
    })

    await changeVenue()

    await userEvent.type(await screen.findByTestId(/serialNumber1/), 'FMK4124R20X')
    await userEvent.type(await screen.findByTestId(/serialNumber2/), 'FMK4124R21X')

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith(`/${params.tenantId}/t/devices/switch`)
  })
  it('should add row and delete row correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/stack/:action' }
    })

    await userEvent.click(await screen.findByTestId('deleteBtn2'))
    await userEvent.click(await screen.findByRole('button', { name: 'Add another member' }))
    await fillInForm()

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith(`/${params.tenantId}/t/devices/switch`)
  })
  it('should show disabled delete button correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/stack/:action' }
    })
    await userEvent.click(await screen.findByTestId('deleteBtn1'))
    await userEvent.click(await screen.findByTestId('deleteBtn2'))

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith(`/${params.tenantId}/t/devices/switch`)
  })
  it('should trigger radio onchange correctly', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/stack/:action' }
    })
    await userEvent.click(await screen.findByTestId('active2'))

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith(`/${params.tenantId}/t/devices/switch`)
  })

  it('should handle add stack by stack switches', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { tenantId: 'tenant-id', switchId: 'switch-id', action: 'add' ,
      venueId: 'venue-id', stackList: 'FEK3224R07X_FEK3224R08X'
    }
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/stack/:venueId/:stackList/:action' }
    })

    expect(await screen.findByText('FEK3224R07X')).toBeVisible()
    expect(await screen.findByText('FEK3224R07X_name')).toBeVisible()
  })

  it('should handle error occurred for stack switches', async () => {
    const params = { tenantId: 'tenant-id', switchId: 'switch-id', action: 'add' ,
      venueId: 'switch-id', stackList: 'FEK3224R07X_FEK3224R08X'
    }
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/stack/:venueId/:stackList/:action' }
    })

    mockServer.use(
      rest.post(SwitchUrlsInfo.convertToStack.url,
        (_, res, ctx) => res(ctx.status(404), ctx.json({})))
    )
    expect(await screen.findByText('FEK3224R07X')).toBeVisible()
    // TODO
    // expect(await screen.findByText('Server Error')).toBeVisible()
  })

  it('should render correct breadcrumb', async () => {
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/stack/:action' }
    })

    await changeVenue()
    await fillInForm()

    expect(await screen.findByText('Add Switch Stack')).toBeVisible()
    expect(await screen.findByText('Wired')).toBeVisible()
    expect(await screen.findByText('Switches')).toBeVisible()
    const link = await screen.findByRole('link', { name: /switch list/i })
    expect(link).toBeTruthy()
  })
})

describe('Switch Stack Form - Edit', () => {
  const params = { tenantId: 'tenant-id', switchId: 'FEK4124R28X', action: 'edit' }
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.get(CommonUrlsInfo.getApGroupListByVenue.url,
        (_, res, ctx) => res(ctx.json(apGrouplist))),
      rest.get(SwitchUrlsInfo.getSwitch.url,
        (_, res, ctx) => res(ctx.json(editStackData))),
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(editStackDetail))),
      rest.post(FirmwareUrlsInfo.getSwitchVenueVersionList.url,
        (_, res, ctx) => res(ctx.json(switchFirmwareVenue))),
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
  it('should submit edit stack form correctly', async () => {
    // TODO:
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/stack/:switchId/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'FEK4124R28X' })).toBeVisible()

    const src = await screen.findByTestId('1_Icon')
    const dst = await screen.findByTestId('dropContainer')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.mouseDown(src)
      fireEvent.mouseMove(dst)

      debounce(async () => {
        fireEvent.mouseUp(dst)
        const applyButton = await screen.findByRole('button', { name: /apply/i })
        await userEvent.click(applyButton)
        expect(applyButton).toHaveAttribute('ant-click-animating-without-extra-node')
      }, 100)
    })
  })
  it('should render edit stack form with real module correctly', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json({ ...editStackDetail,
          model: 'ICX7650-C12P',
          rearModule: 'stack-40g',
          ipFullContentParsed: false
        })))
    )
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/stack/:switchId/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'FEK4124R28X' })).toBeVisible()

    const applyButton = await screen.findByRole('button', { name: /apply/i })
    await userEvent.click(applyButton)
    expect(applyButton).toHaveAttribute('ant-click-animating-without-extra-node')
  })
  it('should render edit stack form with readonly mode correctly', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json({ ...editStackDetail, cliApplied: true })))
    )
    render(<Provider><StackForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/stack/:switchId/:action' }
    })

    // eslint-disable-next-line max-len
    expect(screen.queryByText('These settings cannot be changed, since a CLI profile is applied on the venue.')).toBeNull()
    expect(await screen.findByLabelText(/Stack Name/)).not.toBeDisabled()
    expect(await screen.findByLabelText(/Description/)).not.toBeDisabled()
  })
})
