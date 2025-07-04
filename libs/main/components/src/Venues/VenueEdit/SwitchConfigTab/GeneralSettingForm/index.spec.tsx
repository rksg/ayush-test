import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'


import { venueApi }                                                                                      from '@acx-ui/rc/services'
import { CommonUrlsInfo, ConfigTemplateType, SwitchUrlsInfo }                                            from '@acx-ui/rc/utils'
import { Provider, store }                                                                               from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, within, waitForElementToBeRemoved, renderHook } from '@acx-ui/test-utils'

import {
  successResponse,
  configProfiles,
  venueSwitchSetting,
  switchConfigProfile
} from '../../../__tests__/fixtures'
import { defaultValue }                  from '../../../contentsMap'
import { VenueEditContext, EditContext } from '../../index'

import { GeneralSettingForm, useSwitchProfileDisabled } from '.'

let editContextData = {} as EditContext
const setEditContextData = jest.fn()

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
const params = { venueId: 'venue-id', tenantId: 'tenant-id' }

const mockedUseConfigTemplateVisibilityMap = jest.fn()
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useConfigTemplateVisibilityMap: () => mockedUseConfigTemplateVisibilityMap()
}))

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

describe('GeneralSettingForm', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.post(SwitchUrlsInfo.getProfiles.url,
        (_, res, ctx) => res(ctx.json({ data: configProfiles } ))),
      rest.get(CommonUrlsInfo.getVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json(venueSwitchSetting[0]))),
      rest.put(CommonUrlsInfo.updateVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(SwitchUrlsInfo.getSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json(switchConfigProfile[0])))
    )

    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({})
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          ...defaultValue,
          editContextData, setEditContextData }}>
          <GeneralSettingForm />
        </VenueEditContext.Provider>
      </Provider>, { route: { params } }
    )
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    expect(await screen.findByText('profile01 (Regular)')).toBeVisible()
  })

  it('should render regular profile details correctly', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json(venueSwitchSetting[2]))),
      rest.get(SwitchUrlsInfo.getSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json(switchConfigProfile[1])))
    )

    render(<Provider>
      <VenueEditContext.Provider value={{
        ...defaultValue,
        editContextData, setEditContextData }}>
        <GeneralSettingForm />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('profile02 (Regular)'))

    await userEvent.click(screen.getByRole('button', { name: 'View Details' }))
    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText('VLANs (1)')).toBeVisible()
    expect(within(dialog).getByText('test-vlan')).toBeVisible()
    expect(within(dialog).getByText('ACLs (1)')).toBeVisible()
    expect(within(dialog).getByText('test-acl')).toBeVisible()
    await userEvent.click(within(dialog).getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('should handle regular profile change', async () => {
    render(<Provider>
      <VenueEditContext.Provider value={{
        ...defaultValue,
        editContextData, setEditContextData }}>
        <GeneralSettingForm />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('profile01 (Regular)'))

    await userEvent.click(screen.getByRole('button', { name: 'View Details' }))
    expect(await screen.findByText('VLANs (0)')).toBeVisible()
    expect(screen.getByText('ACLs (0)')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))

    await userEvent.click(screen.getByRole('button', { name: 'Change' }))
    await userEvent.click(await screen.findByText('No Profile'))
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(await screen.findByText('No Profile is selected')).toBeVisible()
  })

  it('should render CLI profile details correctly', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json(venueSwitchSetting[1]))),
      rest.get(
        SwitchUrlsInfo.getSwitchConfigProfileDetail.url,
        (_, res, ctx) => res(ctx.json(configProfiles[2]))
      )
    )
    render(<Provider>
      <VenueEditContext.Provider value={{
        ...defaultValue,
        editContextData, setEditContextData }}>
        <GeneralSettingForm />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('2 CLI profiles selected'))

    fireEvent.click(screen.getByRole('button', { name: 'View Details' }))
    fireEvent.mouseDown(screen.getByRole('combobox'))
    fireEvent.click(await screen.findByText('profile-cli03'))
    expect(await screen.findByText('3 models')).toBeVisible()
    expect(await screen.findByText(/profile-cli03 cli test/)).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
  })

  it('should handle selected profile change', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json(venueSwitchSetting[1])))
    )
    render(<Provider>
      <VenueEditContext.Provider value={{
        ...defaultValue,
        editContextData, setEditContextData }}>
        <GeneralSettingForm />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('2 CLI profiles selected'))

    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    await screen.findByText('Select configuration profile')

    fireEvent.click(screen.getByRole('tab', { name: 'CLI Profiles' }))
    expect(await screen.findByText('2 selected')).toBeVisible()
    fireEvent.click(await screen.findByText('profile-cli02'))
    expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled() // overlapping models

    fireEvent.click(await screen.findByText('profile-cli01')) // deselect
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(await screen.findByText('2 CLI profiles selected')).toBeVisible()
  })

  it('should disabled settings when the CLI profiles selected', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json({
          ...venueSwitchSetting[1],
          cliApplied: false
        })))
    )
    render(<Provider>
      <VenueEditContext.Provider value={{
        ...defaultValue,
        editContextData, setEditContextData }}>
        <GeneralSettingForm />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('2 CLI profiles selected'))

    const addIpAddressButton = screen.getByRole('button', { name: 'Add IP Address' })
    expect(addIpAddressButton).toBeDisabled()
  })


  it('should handle DNS update', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json({
          ...venueSwitchSetting[2],
          cliApplied: false
        })))
    )
    render(<Provider>
      <VenueEditContext.Provider value={{
        ...defaultValue,
        editContextData, setEditContextData }}>
        <GeneralSettingForm />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await screen.findByText('profile02 (Regular)')

    await userEvent.click(screen.getByRole('button', { name: 'Add IP Address' }))
    // TODO: add test for edit dns

    const deleteBtns = screen.getAllByRole('deleteBtn')
    expect(deleteBtns).toHaveLength(1)
    fireEvent.click(deleteBtns[0])
  })

  it('should handle Syslog Server change and setting update', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json({
          ...venueSwitchSetting[2],
          cliApplied: false
        })))
    )
    render(<Provider>
      <VenueEditContext.Provider value={{
        ...defaultValue,
        editContextData, setEditContextData }}>
        <GeneralSettingForm />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await screen.findByText('profile02 (Regular)')

    expect(screen.getByRole('switch')).not.toBeChecked()
    fireEvent.click(screen.getByRole('switch'))
    await screen.findByText('Syslog Server Configuration')
    fireEvent.change(screen.getByLabelText('Server 1 IP Address'), { target: { value: '1.1.1.2' } })
    fireEvent.change(screen.getByLabelText('Server 2 IP Address'), { target: { value: '1.1.1.3' } })
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    // disable Syslog Server
    userEvent.click(screen.getByRole('switch'))
    expect(screen.getByRole('switch')).not.toBeChecked()

    // trigger Syslog Server modal by configuration icon
    fireEvent.click(screen.getByRole('configBtn'))
    fireEvent.click(
      await within(screen.getByRole('dialog')).findByRole('button', { name: 'Cancel' })
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
  })

  it('should navigate to venue list page when clicking cancel button', async () => {
    render(<Provider>
      <VenueEditContext.Provider value={{
        ...defaultValue,
        editContextData, setEditContextData }}>
        <GeneralSettingForm />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('profile01 (Regular)'))

    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.click(
      await within(screen.getByRole('dialog')).findByRole('button', { name: 'Cancel' })
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/venues`,
      hash: '',
      search: ''
    })
  })

  describe('useSwitchProfileDisabled', () => {
    const mockedConfigTemplateVisibilityMap: Record<ConfigTemplateType, boolean> = {
      [ConfigTemplateType.NETWORK]: false,
      [ConfigTemplateType.VENUE]: false,
      [ConfigTemplateType.DPSK]: false,
      [ConfigTemplateType.RADIUS]: false,
      [ConfigTemplateType.DHCP]: false,
      [ConfigTemplateType.ACCESS_CONTROL]: false,
      [ConfigTemplateType.PORTAL]: false,
      [ConfigTemplateType.VLAN_POOL]: false,
      [ConfigTemplateType.WIFI_CALLING]: false,
      [ConfigTemplateType.CLIENT_ISOLATION]: false,
      [ConfigTemplateType.LAYER_2_POLICY]: false,
      [ConfigTemplateType.LAYER_3_POLICY]: false,
      [ConfigTemplateType.DEVICE_POLICY]: false,
      [ConfigTemplateType.APPLICATION_POLICY]: false,
      [ConfigTemplateType.ROGUE_AP_DETECTION]: false,
      [ConfigTemplateType.SYSLOG]: false,
      [ConfigTemplateType.SWITCH_REGULAR]: false,
      [ConfigTemplateType.SWITCH_CLI]: false,
      [ConfigTemplateType.AP_GROUP]: false
    }
    beforeEach(() => {
      mockedUseConfigTemplateVisibilityMap.mockReturnValue({ ...mockedConfigTemplateVisibilityMap })
    })
    it('should return true if isTemplate is true and profileEnabled is false', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
      mockedUseConfigTemplateVisibilityMap.mockReturnValue({
        ...mockedConfigTemplateVisibilityMap,
        [ConfigTemplateType.SWITCH_REGULAR]: false
      })

      const { result } = renderHook(() => useSwitchProfileDisabled())

      expect(result.current).toBe(true)
    })

    it('should return false if isTemplate is false', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })

      const { result } = renderHook(() => useSwitchProfileDisabled())

      expect(result.current).toBe(false)
    })

    it('should return false if isTemplate is true and profileEnabled is true', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
      mockedUseConfigTemplateVisibilityMap.mockReturnValue({
        ...mockedConfigTemplateVisibilityMap,
        [ConfigTemplateType.SWITCH_REGULAR]: true
      })

      const { result } = renderHook(() => useSwitchProfileDisabled())

      expect(result.current).toBe(false)
    })
  })
})
