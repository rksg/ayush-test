import userEvent   from '@testing-library/user-event'
import { message } from 'antd'
import { rest }    from 'msw'

import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
import { firmwareApi, switchApi, venueApi } from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  FirmwareRbacUrlsInfo,
  FirmwareUrlsInfo,
  SwitchFirmwareFixtures,
  SwitchUrlsInfo,
  SwitchRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  mockServer,
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved,
  waitFor
} from '@acx-ui/test-utils'

import { staticRoutes, switchFirmwareVenue, switchVenueV1002 } from '../__tests__/fixtures'

import {
  swtichListResponse,
  venueListResponse,
  vlansByVenueListResponse,
  switchResponse,
  switchDetailHeader
} from './__tests__/fixtures'

import { SwitchForm } from '.'

const { mockSwitchCurrentVersions, mockSwitchCurrentVersionsV1002 } = SwitchFirmwareFixtures
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetSwitcDefaultVersionsQuery: () => ({
    data: mockSwitchCurrentVersions
  }),
  useGetSwitchCurrentVersionsQuery: () => ({
    data: mockSwitchCurrentVersions
  }),
  useGetSwitchCurrentVersionsV1001Query: () => ({
    data: mockSwitchCurrentVersionsV1002
  })
}))

describe('Add switch form', () => {
  const params = { tenantId: 'tenant-id', action: 'add' }
  beforeEach(() => {
    store.dispatch(firmwareApi.util.resetApiState())
    store.dispatch(switchApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())

    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.post(FirmwareUrlsInfo.getSwitchVenueVersionList.url,
        (_, res, ctx) => res(ctx.json(switchFirmwareVenue))),
      rest.post(FirmwareRbacUrlsInfo.getSwitchVenueVersionList.url,
        (_, res, ctx) => res(ctx.json(switchVenueV1002))),
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
    await userEvent.click(addButton)
    expect(await screen.findByRole('heading', { name: /switch/i } )).toBeVisible()
  })

  it('should cannot add TSB standalone switch', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.SWITCH_RBAC_API)
    render(<Provider><SwitchForm /></Provider>, {
      route: {
        params: { tenantId: 'tenant-id', action: 'add' },
        path: '/:tenantId/t/devices/switch/:action'
      }
    })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/add switch/i)).toBeVisible()

    await userEvent.click(screen.getByRole('combobox', {
      name: /venue/i
    }))
    const venue = await screen.findAllByText('Karen-New')
    await userEvent.click(venue[0])

    const serialNumber = screen.getByRole('textbox', {
      name: /serial number/i
    })
    await userEvent.type(serialNumber, 'FJN3227U04A')

    await screen.findByText(/ICX7150-48ZP/i)

    const addButton = await screen.findByRole('button', { name: /add/i })
    await userEvent.click(addButton)
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeVisible()
    })
    expect(screen.getByText(/Switch could not be added/i)).toBeVisible()
  })

  it('should add stack member correctly', async () => {
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/:action' }
    })
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
    await userEvent.click(addButton)
    expect(await screen.findByRole('heading', { name: /switch/i } )).toBeVisible()
  })

  it('should cancel chanage correctly', async () => {
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/:action' }
    })
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
    await userEvent.click(addButton)
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
    await userEvent.click(addButton)
    expect(await screen.findByRole('heading', { name: /switch/i } )).toBeVisible()
  })
})


describe('Edit switch form', () => {
  const mockUpdateSwitch = jest.fn()
  const params = {
    tenantId: 'tenant-id',
    switchId: 'switch-id',
    serialNumber: 'serial-number',
    action: 'edit'
  }
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(SwitchUrlsInfo.getVlansByVenue.url,
        (_, res, ctx) => res(ctx.json(vlansByVenueListResponse))),
      rest.post(FirmwareUrlsInfo.getSwitchVenueVersionList.url,
        (_, res, ctx) => res(ctx.json(switchFirmwareVenue))),
      rest.get(SwitchUrlsInfo.getStaticRoutes.url,
        (_, res, ctx) => res(ctx.json(staticRoutes))),
      rest.get(SwitchUrlsInfo.getSwitch.url,
        (_, res, ctx) => res(ctx.json(switchResponse))),
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(switchDetailHeader))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.post(FirmwareRbacUrlsInfo.getSwitchVenueVersionList.url,
        (_, res, ctx) => res(ctx.json(switchVenueV1002))),
      rest.put(SwitchUrlsInfo.updateSwitch.url,
        (_, res, ctx) => {
          mockUpdateSwitch()
          return res(ctx.json({ requestId: 'request-id' }))
        })
    )
  })
  afterEach(() => {
    message.destroy()
    mockUpdateSwitch.mockClear()
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
    await userEvent.click(settingsTab)
    const ipModeRadio = await screen.findByRole('radio', { name: 'Static/Manual' })
    await userEvent.click(ipModeRadio)

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.change(
        await screen.findByLabelText('IP Address'), { target: { value: '192.168.1.71' } })
      fireEvent.change(
        await screen.findByLabelText('Subnet Mask'), { target: { value: '255.255.0.0' } })
      fireEvent.change(
        await screen.findByLabelText('Default Gateway'), { target: { value: '192.168.1.1' } })
    })
    await userEvent.click(
      await screen.findByRole('switch'))
    const jumboOkBtn = await screen.findByRole('button', { name: /ok/i })
    await userEvent.click(jumboOkBtn)
    const applyButton = await screen.findByRole('button', { name: /apply/i })

    await userEvent.click(applyButton)
    expect(mockUpdateSwitch).toBeCalled()
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
    await userEvent.click(applyButton)
    expect(mockUpdateSwitch).toBeCalled()
  })

  it('should render edit switch form with readonly mode correctly', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json({ ...switchDetailHeader, cliApplied: true })))
    )
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/:action' }
    })

    // eslint-disable-next-line max-len
    expect(screen.queryByText('These settings cannot be changed, since a CLI profile is applied on the venue.')).toBeNull()
    expect(await screen.findByLabelText(/Serial Number/)).toBeDisabled()
    expect(await screen.findByLabelText(/Switch Name/)).not.toBeDisabled()
    expect(await screen.findByLabelText(/Description/)).not.toBeDisabled()
  })

  // eslint-disable-next-line max-len
  it('should not block form submit when switch is offline and settings tab has invalid field values', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitch.url,
        (_, res, ctx) => res(ctx.json({
          ...switchResponse,
          igmpSnooping: ''
        }))
      ),
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json({
          ...switchDetailHeader,
          deviceStatus: 'OFFLINE'
        }))
      )
    )
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/:action' }
    })

    await waitFor(async () =>
      expect(await screen.findByLabelText(/Serial Number/)).toHaveValue('FEK3233R18P')
    )
    expect(await screen.findByLabelText(/Serial Number/)).toBeDisabled()

    await userEvent.click(await screen.findByRole('button', { name: /apply/i }))
    expect(mockUpdateSwitch).toBeCalled()
  })

  // eslint-disable-next-line max-len
  it('should not show toast message when the details and settings tab both have invalid field values', async () => {
    // eslint-disable-next-line max-len
    const longSwitchName = 'ICX7150-C12 Router vhQKuZoqFy0fI5BR2h34PZFmV4ndAPVrdzg1Bw7jJYHf2opN5Bev1c7PCwobQtILj4GNHHhUsUFAW3h2wfcRvCM5qBs2OLsbNpa2WlUN6JwdbbC26TjPIkJTFBQ3PCFfW22d0DKPpIwur98vB9fk8t8Hh9zx2mGRttHa0SAJaqEtquVYgXrPkpHMFo0Gs5c9iS3jt6gzdSBKbEgnj9Ju8OD4ts9b3BxmnDiVwLMraNpqsfJR0wNx1e2yfVYM6If5'
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitch.url,
        (_, res, ctx) => res(ctx.json({
          ...switchResponse,
          name: longSwitchName,
          igmpSnooping: ''
        })))
    )
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/:action' }
    })

    await waitFor(async () =>
      expect(await screen.findByLabelText(/Serial Number/)).toHaveValue('FEK3233R18P')
    )
    expect(await screen.findByLabelText(/Serial Number/)).toBeDisabled()
    await userEvent.click(await screen.findByRole('button', { name: /apply/i }))
    expect(mockUpdateSwitch).not.toBeCalled()
    expect(await screen.findByRole('tab', { name: 'Switch Details' })).toBeTruthy()
    expect(screen.queryByText(
      /Please check the invalid field values under the settings tab/i
    )).toBeNull()
  })

  it('should show toast message when the settings tab has invalid field values', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitch.url,
        (_, res, ctx) => res(ctx.json({
          ...switchResponse,
          igmpSnooping: ''
        }))
      )
    )
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/:action' }
    })

    await waitFor(async () =>
      expect(await screen.findByLabelText(/Serial Number/)).toHaveValue('FEK3233R18P')
    )
    expect(await screen.findByLabelText(/Serial Number/)).toBeDisabled()
    await userEvent.click(await screen.findByRole('button', { name: /apply/i }))
    expect(mockUpdateSwitch).not.toBeCalled()
    expect(await screen.findByRole('tab', { name: 'Settings' })).toBeTruthy()
    expect(await screen.findByText(
      /Please check the invalid field values under the settings tab/i
    )).toBeVisible()
  })

  // eslint-disable-next-line max-len
  it('should show toast message when the settings tab has invalid field values in read-only mode', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitch.url,
        (_, res, ctx) => res(ctx.json({
          ...switchResponse,
          igmpSnooping: ''
        }))
      ),
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json({
          ...switchDetailHeader,
          cliApplied: true
        }))
      )
    )
    render(<Provider><SwitchForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/:action' }
    })

    await waitFor(async () =>
      expect(await screen.findByLabelText(/Serial Number/)).toHaveValue('FEK3233R18P')
    )
    expect(await screen.findByLabelText(/Serial Number/)).toBeDisabled()
    await userEvent.click(await screen.findByRole('button', { name: /apply/i }))
    expect(mockUpdateSwitch).not.toBeCalled()
    expect(await screen.findByRole('tab', { name: 'Settings' })).toBeTruthy()
    expect(await screen.findByText(
      /Please check the invalid field values under the settings tab and modify it via CLI/i
    )).toBeVisible()
  })

  describe('Flexible Authentication (base on Switch RBAC FF enabled)', () => {
    const mockedGetSwitchFlexAuth = jest.fn()
    const mockedUpdateSwitchFlexAuth = jest.fn()
    beforeEach(() => {
      mockedGetSwitchFlexAuth.mockClear()
      mockedUpdateSwitchFlexAuth.mockClear()
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_RBAC_API)
      mockServer.use(
        rest.get(SwitchRbacUrlsInfo.getSwitch.url,
          (_, res, ctx) => res(ctx.json(switchResponse))
        ),
        rest.post(SwitchRbacUrlsInfo.getSwitchList.url,
          (_, res, ctx) => res(ctx.json(swtichListResponse))
        ),
        rest.get(SwitchRbacUrlsInfo.getStaticRoutes.url,
          (_, res, ctx) => res(ctx.json(staticRoutes))
        ),
        rest.get(SwitchUrlsInfo.getSwitchAuthentication.url,
          (_, res, ctx) => {
            mockedGetSwitchFlexAuth()
            return res(ctx.json({
              authEnable: false,
              authDefaultVlan: '',
              guestVlan: ''
            }))
          }
        ),
        rest.put(SwitchUrlsInfo.updateSwitchAuthentication.url,
          (_, res, ctx) => {
            mockedUpdateSwitchFlexAuth()
            return res(ctx.json({}))
          }
        )
      )
    })

    it('should render correctly when the FF is disabled', async () => {
      mockServer.use(
        rest.get(SwitchRbacUrlsInfo.getSwitchDetailHeader.url,
          (_, res, ctx) => res(ctx.json({
            ...switchDetailHeader,
            firmware: 'SPR10010f_b467',
            firmwareVersion: 'SPR10010f_b467'
          }))
        )
      )
      render(<Provider><SwitchForm /></Provider>, {
        route: { params, path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/:action' }
      })
      await waitFor(async () =>
        expect(await screen.findByLabelText(/Serial Number/)).toHaveValue('FEK3233R18P')
      )

      await userEvent.click(await screen.findByRole('tab', { name: 'Settings' }))
      expect(mockedGetSwitchFlexAuth).not.toBeCalled()
      expect(screen.queryByText(/Authentication/)).toBeNull()
    })

    // eslint-disable-next-line max-len
    it('should render correctly when the FF is enabled and the switch firmware version is below 10.0.10f', async () => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.SWITCH_FLEXIBLE_AUTHENTICATION || ff === Features.SWITCH_RBAC_API
      )
      mockServer.use(
        rest.get(SwitchRbacUrlsInfo.getSwitchDetailHeader.url,
          (_, res, ctx) => res(ctx.json({
            ...switchDetailHeader,
            firmware: 'SPS09010j_cd3',
            firmwareVersion: 'SPS09010j_cd3'
          }))
        )
      )
      render(<Provider><SwitchForm /></Provider>, {
        route: { params, path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/:action' }
      })
      await waitFor(async () =>
        expect(await screen.findByLabelText(/Serial Number/)).toHaveValue('FEK3233R18P')
      )

      await userEvent.click(await screen.findByRole('tab', { name: 'Settings' }))
      expect(mockedGetSwitchFlexAuth).not.toBeCalled()
      expect(screen.queryByText(/Authentication/)).toBeNull()
    })

    // eslint-disable-next-line max-len
    it('should render correctly when the FF is enabled and the firmware version is 10.0.10f or higher', async () => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.SWITCH_FLEXIBLE_AUTHENTICATION || ff === Features.SWITCH_RBAC_API
      )
      mockServer.use(
        rest.get(SwitchRbacUrlsInfo.getSwitchDetailHeader.url,
          (_, res, ctx) => res(ctx.json({
            ...switchDetailHeader,
            firmware: 'SPR10010f_b467',
            firmwareVersion: 'SPR10010f_b467'
          }))
        )
      )
      render(<Provider><SwitchForm /></Provider>, {
        route: { params, path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/:action' }
      })
      await waitFor(async () =>
        expect(await screen.findByLabelText(/Serial Number/)).toHaveValue('FEK3233R18P')
      )

      await waitFor(async () =>
        expect(mockedGetSwitchFlexAuth).toBeCalled()
      )
      await userEvent.click(await screen.findByRole('tab', { name: 'Settings' }))
      expect(await screen.findByText(/Authentication/)).toBeVisible()
    })

    it('should update switch flex auth correctly', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.SWITCH_FLEXIBLE_AUTHENTICATION || ff === Features.SWITCH_RBAC_API
      )
      mockServer.use(
        rest.get(SwitchRbacUrlsInfo.getSwitchDetailHeader.url,
          (_, res, ctx) => res(ctx.json({
            ...switchDetailHeader,
            defaultGateway: '192.168.1.100',
            name: 'stack-name',
            firmware: 'SPR10010f_b467',
            firmwareVersion: 'SPR10010f_b467'
          }))
        ),
        rest.get(SwitchUrlsInfo.getSwitchAuthentication.url,
          (_, res, ctx) => {
            mockedGetSwitchFlexAuth()
            return res(ctx.json({
              authEnable: true,
              authDefaultVlan: 2,
              guestVlan: ''
            })
            )}
        )
      )
      render(<Provider><SwitchForm /></Provider>, {
        route: { params, path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/:action' }
      })
      await waitFor(async () =>
        expect(await screen.findByLabelText(/Serial Number/)).toHaveValue('FEK3233R18P')
      )

      await userEvent.click(await screen.findByRole('tab', { name: 'Settings' }))
      expect(mockedGetSwitchFlexAuth).toBeCalled()
      expect(await screen.findByText(/Authentication/)).toBeVisible()
      await userEvent.type(await screen.findByLabelText(/Guest VLAN/), '2')
      await waitFor(async () => {
        expect(
          await screen.findByText('VLAN ID can not be the same as Auth Default VLAN')
        ).toBeVisible()
      })
      await userEvent.type(await screen.findByLabelText(/Guest VLAN/), '9')

      const applyButton = await screen.findByRole('button', { name: /apply/i })
      await userEvent.click(applyButton)
      await waitFor(async () =>
        expect(mockedUpdateSwitchFlexAuth).toBeCalled()
      )
    })
  })
})