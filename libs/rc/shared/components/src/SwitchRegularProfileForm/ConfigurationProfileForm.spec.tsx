import '@testing-library/jest-dom'
import userEvent    from '@testing-library/user-event'
import { Modal }    from 'antd'
import { debounce } from 'lodash'
import { rest }     from 'msw'

import { Features, useIsSplitOn }                                                                                   from '@acx-ui/feature-toggle'
import { switchApi, venueApi }                                                                                      from '@acx-ui/rc/services'
import { CommonUrlsInfo, ConfigTemplateUrlsInfo, SwitchConfigTemplateUrlsInfo, SwitchUrlsInfo, SwitchRbacUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                          from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, within }                                                   from '@acx-ui/test-utils'

import {
  profilesExistResponse,
  familyModels,
  venues,
  profile,
  profilewithtp,
  profileWithVoiceVlan
} from './__tests__/fixtures'
import { ConfigurationProfileForm }                                  from './ConfigurationProfileForm'
import { ConfigurationProfileFormContext, ConfigurationProfileType } from './ConfigurationProfileFormContext'

const currentData = {
  name: '111',
  description: '',
  acls: []
}

const configureProfileContextValues = {
  editMode: false,
  currentData
} as unknown as ConfigurationProfileType

const mockNavigate = jest.fn()
const mockedUpdateFn = jest.fn()
const mockedAssociate = jest.fn()
const mockedDisassociate = jest.fn()
const mockedUseConfigTemplate = jest.fn()

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

describe('Wired', () => {
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    mockServer.use(
      rest.post(SwitchUrlsInfo.addSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.post(SwitchUrlsInfo.getProfiles.url,
        (_, res, ctx) => res(ctx.json(profilesExistResponse))
      ),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venues))
      ),
      rest.get(SwitchUrlsInfo.getCliFamilyModels.url,
        (_, res, ctx) => res(ctx.json(familyModels))
      ),
      rest.get(SwitchUrlsInfo.getSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json(profile))
      ),
      rest.post(SwitchUrlsInfo.addSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.put(SwitchUrlsInfo.updateSwitchConfigProfile.url,
        (_, res, ctx) => {
          mockedUpdateFn()
          return res(ctx.json({}))
        }
      )
    )
  })

  afterEach(() => {
    mockedUpdateFn.mockClear()
    mockedAssociate.mockClear()
    mockedDisassociate.mockClear()
    mockedUseConfigTemplate.mockRestore()
    Modal.destroyAll()
  })

  it.skip('should render Switch Configuration Profile form correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'add'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/:action' }
      })

    expect(await screen.findByText('Add Switch Configuration Profile')).toBeVisible()
    const profileNameInput = await screen.findByLabelText('Profile Name')
    fireEvent.change(profileNameInput, { target: { value: 'profiletest' } })
    const profileDescInput = await screen.findByLabelText('Profile Description')
    fireEvent.change(profileDescInput, { target: { value: 'profiledesc' } })
    fireEvent.blur(profileNameInput)
    expect(await screen.findByRole('img', { name: 'check-circle' })).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'add'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/:action' }
      })

    expect(await screen.findByText('Wired')).toBeVisible()
    expect(await screen.findByText('Wired Network Profiles')).toBeVisible()
    expect(screen.getByRole('link', {
      name: /configuration profiles/i
    })).toBeTruthy()
  })

  it('should render edit Switch Configuration Profile form correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      profileId: 'profile-id',
      action: 'edit'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={{
          ...configureProfileContextValues,
          editMode: true
        }}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/regular/:profileId/:action' }
      })

    expect(await screen.findByText('Edit Switch Configuration Profile')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockNavigate).toHaveBeenCalledWith({
      hash: '', pathname: '/tenant-id/t/networks/wired/profiles', search: '' }, { replace: true }
    )
  })

  it.skip('should render create Switch Configuration Profile correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'add'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/:action' }
      })

    const profileNameInput = await screen.findByLabelText('Profile Name')
    fireEvent.change(profileNameInput, { target: { value: 'profiletest' } })
    fireEvent.blur(profileNameInput)
    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )

    await screen.findByRole('heading', { level: 3, name: /VLANs/i })
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )

    await screen.findByRole('heading', { level: 3, name: /ACLs/i })
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )

    await screen.findByRole('heading', { level: 3, name: /Venues/i })
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )

    await screen.findByRole('heading', { level: 3, name: /Summary/i })
    await userEvent.click(await screen.findByRole('button', { name: /Add/i }) )
  })

  it.skip('should render Switch Configuration Profile form with VLAN correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'add'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/:action' }
      })

    const profileNameInput = await screen.findByLabelText('Profile Name')
    fireEvent.change(profileNameInput, { target: { value: 'profiletest' } })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /VLANs/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Add VLAN' }))
    const vIdInput = await screen.findByLabelText('VLAN ID')
    fireEvent.change(vIdInput, { target: { value: '1' } })

    await userEvent.click(await screen.findByRole('button', { name: 'Add Model' }))
    const vlanSettingModal = await screen.findByTestId('vlanSettingModal')
    const family = await within(vlanSettingModal).findByTestId('ICX7150')
    await userEvent.click(family)
    const model = await within(vlanSettingModal).findByTestId('24')
    await userEvent.click(model)
    const nextTrustPortButton =
      await within(vlanSettingModal).findByRole('button', { name: 'Next' })
    await userEvent.click(nextTrustPortButton)

    await userEvent.click(await within(vlanSettingModal).findByTestId('untagged_module1_1_1'))
    await userEvent.click(await within(vlanSettingModal).findByTestId('untagged_module1_2_1'))
    await userEvent.click(await within(vlanSettingModal).findByTestId('untagged_module1_3_1'))
    const nextTrustPortButton1 =
      await within(vlanSettingModal).findByRole('button', { name: 'Next' })
    await userEvent.click(nextTrustPortButton1)

    await userEvent.click(await within(vlanSettingModal).findByTestId('tagged_module1_1_2'))
    await userEvent.click(await within(vlanSettingModal).findByTestId('tagged_module1_2_2'))
    await userEvent.click(await within(vlanSettingModal).findByTestId('tagged_module1_3_2'))
    const saveTrustPortButton =
      await within(vlanSettingModal).findAllByRole('button', { name: 'Add' })
    await userEvent.click(saveTrustPortButton[0])

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /ACLs/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Venues/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Summary/i })

    const finishButton = await screen.findAllByRole('button', { name: /Add/i })
    await userEvent.click(finishButton[1])
  })

  it('should edit Switch Configuration Profile form', async () => {
    const profileValues = {
      editMode: true,
      currentData: profile
    } as unknown as ConfigurationProfileType

    const params = {
      tenantId: 'tenant-id',
      profileId: 'b27ddd7be108495fb9175cec5930ce63',
      action: 'edit'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={profileValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/regular/:profileId/:action' }
      })

    const profileNameInput = await screen.findByLabelText('Profile Name')
    fireEvent.change(profileNameInput, { target: { value: 'profiletest' } })
    fireEvent.blur(profileNameInput)
    expect(await screen.findByRole('img', { name: 'check-circle' })).toBeVisible()

    await userEvent.click(await screen.findByText('VLANs'))
    await screen.findByRole('heading', { level: 3, name: /VLANs/i })

    await userEvent.click(await screen.findByText('ACLs'))
    await screen.findByRole('heading', { level: 3, name: /ACLs/i })

    await userEvent.click(await screen.findByText('Venues'))
    await screen.findByRole('heading', { level: 3, name: /Venues/i })

    await userEvent.click(await screen.findByText('Summary'))
    await screen.findByRole('heading', { level: 3, name: /Summary/i })

    const finishButton = await screen.findByRole('button', { name: /Apply/i })
    await userEvent.click(finishButton)
  })

  it.skip('should render Profile form with drag select VLAN ports correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'add'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/:action' }
      })

    const profileNameInput = await screen.findByLabelText('Profile Name')
    fireEvent.change(profileNameInput, { target: { value: 'profiletest' } })
    fireEvent.blur(profileNameInput)
    expect(await screen.findByRole('img', { name: 'check-circle' })).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /VLANs/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Add VLAN' }))
    const vIdInput = await screen.findByLabelText('VLAN ID')
    fireEvent.change(vIdInput, { target: { value: '1' } })

    await userEvent.click(await screen.findByRole('button', { name: 'Add Model' }))
    const dialog = await screen.findByTestId('vlanSettingModal')
    const family = await within(dialog).findByText('ICX-7150')
    await userEvent.click(family)
    const model = await within(dialog).findByText('24')
    await userEvent.click(model)
    const nextTrustPortButton = await within(dialog).findByRole('button', { name: 'Next' })
    await userEvent.click(nextTrustPortButton)

    const dst = await screen.findAllByTestId('untagged_module1_1_1')
    const src = await screen.findAllByTestId('untagged_module1_1_11')
    fireEvent.mouseDown(src[0])
    fireEvent.mouseMove(dst[0])
    debounce(() => {
      fireEvent.mouseUp(dst[0])
    }, 100)
    const nextTrustPortButton1 = await within(dialog).findByRole('button', { name: 'Next' })
    await userEvent.click(nextTrustPortButton1)

    await userEvent.click(await within(dialog).findByTestId('tagged_module1_1_21'))
    const saveTrustPortButton = await within(dialog).findAllByRole('button', { name: 'Add' })
    await userEvent.click(saveTrustPortButton[0])

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /ACLs/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Venues/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Summary/i })

    const finishButton = await screen.findAllByRole('button', { name: /Finish/i })
    await userEvent.click(finishButton[1])
  })

  it.skip('should render create Configuration Profile with extended acl correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'add'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/:action' }
      })

    const profileNameInput = await screen.findByLabelText('Profile Name')
    fireEvent.change(profileNameInput, { target: { value: 'profiletest' } })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /VLANs/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /ACLs/i })
    await userEvent.click(await screen.findByRole('button', { name: 'Add ACL' }))
    const aclNameInput = await screen.findByLabelText(/ACL Name/i)
    fireEvent.change(aclNameInput, { target: { value: '100' } })
    const extendedOption = await screen.findByTestId('aclExtended')
    await userEvent.click(extendedOption)
    const aclDialog = await screen.findByRole('dialog')
    await userEvent.click(await within(aclDialog).findByRole('button', { name: 'Add' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Venues/i })
    const venueSwitch = await screen.findAllByRole('switch')
    await userEvent.click(venueSwitch[0])
    await userEvent.click(venueSwitch[1])
    await userEvent.click(venueSwitch[0])

    const venueCheckbox = await screen.findAllByRole('checkbox')
    await userEvent.click(venueCheckbox[0])
    await userEvent.click(await screen.findByRole('button', { name: 'Deactivate' }) )
    expect(venueSwitch[0]).not.toBeChecked()
    await userEvent.click(await screen.findByRole('button', { name: 'Activate' }) )
    expect(venueSwitch[0]).toBeChecked()
  })

  it.skip('should create Switch Configuration Profile with trust ports correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'add'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/:action' }
      })

    const profileNameInput = await screen.findByLabelText('Profile Name')
    fireEvent.change(profileNameInput, { target: { value: 'profiletest' } })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /VLANs/i })

    await userEvent.click(await screen.findByRole('button', { name: /Add VLAN/i }))
    const vIdInput = await screen.findByLabelText('VLAN ID')
    fireEvent.change(vIdInput, { target: { value: '1' } })
    await userEvent.click((await screen.findByTestId('dhcpSnooping')))
    await userEvent.click((await screen.findByTestId('arpInspection')))
    await userEvent.click(await screen.findByRole('button', { name: 'Add Model' }))
    const vlansPortModal = await screen.findByTestId('vlanSettingModal')
    const family = await within(vlansPortModal).findByTestId('ICX7150')
    await userEvent.click(family)
    const model = await within(vlansPortModal).findByTestId('24')
    await userEvent.click(model)
    const nextVlansPortButton1 =
      await within(vlansPortModal).findByRole('button', { name: 'Next' })
    await userEvent.click(nextVlansPortButton1)

    await userEvent.click(await within(vlansPortModal).findByTestId('untagged_module1_1_1'))
    const nextVlansPortButton2 =
      await within(vlansPortModal).findByRole('button', { name: 'Next' })
    await userEvent.click(nextVlansPortButton2)
    await userEvent.click(await within(vlansPortModal).findByTestId('tagged_module1_1_2'))
    const nextVlansPortButton3 =
      await within(vlansPortModal).findByRole('button', { name: 'Add' })
    await userEvent.click(nextVlansPortButton3)

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /ACLs/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Trusted Ports/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Please select...' }))

    const trustedPortModal = await screen.findByTestId('trustedPortModal')
    expect(trustedPortModal).toBeVisible()
    const truestedPortButtons = await within(trustedPortModal).findByText('Trusted Ports')
    await userEvent.click(truestedPortButtons)
    const trustedPortsComboBox = await within(trustedPortModal).findByRole('combobox')
    await userEvent.click(trustedPortsComboBox)
    const optionValues = await screen.findAllByText('1/1/1')
    await userEvent.click(optionValues[1])

    const saveTrustPortButton =
      await within(trustedPortModal).findByRole('button', { name: 'Apply' })
    await userEvent.click(saveTrustPortButton)

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Venues/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Summary/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }) )
  })

  it.skip('should create Switch Configuration Profile with ICX7550 correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'add'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/:action' }
      })

    const profileNameInput = await screen.findByLabelText('Profile Name')
    fireEvent.change(profileNameInput, { target: { value: 'profiletest' } })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /VLANs/i })

    await userEvent.click(await screen.findByRole('button', { name: /Add VLAN/i }))
    const vIdInput = await screen.findByLabelText('VLAN ID')
    fireEvent.change(vIdInput, { target: { value: '1' } })
    await userEvent.click((await screen.findByTestId('dhcpSnooping')))
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /ACLs/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Trusted Ports/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Add Model' }))
    const trustedPortModal = await screen.findByRole('dialog')
    const family1 = await within(trustedPortModal).findByTestId('ICX7850')
    await userEvent.click(family1)
    const model1 = await within(trustedPortModal).findByTestId('48F')
    await userEvent.click(model1)
    const model2 = await within(trustedPortModal).findByTestId('48C')
    await userEvent.click(model2)
    const module1 = await within(trustedPortModal).findByRole('checkbox')
    await userEvent.click(module1)
    const family2 = await within(trustedPortModal).findByTestId('ICX7550')
    await userEvent.click(family2)
    const model3 = await within(trustedPortModal).findByTestId('48ZP')
    await userEvent.click(model3)
    const module2 = await within(trustedPortModal).findByRole('checkbox')
    await userEvent.click(module2)
    const nextTrustPortButton =
      await within(trustedPortModal).findByRole('button', { name: 'Next' })
    await userEvent.click(nextTrustPortButton)

    fireEvent.change(await within(trustedPortModal).findByRole('combobox'), {
      target: { value: '1/1/1' }
    })
    fireEvent.keyPress(await within(trustedPortModal).findByRole('combobox'),
      { key: 'Enter', code: 13, charCode: 13 })
    const saveTrustPortButton =
      await within(trustedPortModal).findByRole('button', { name: 'Add' })
    await userEvent.click(saveTrustPortButton)
  })
  it('Edit Switch Configuration Profile form with trusted ports', async () => {
    const profileValues = {
      editMode: true,
      currentData: profilewithtp
    } as unknown as ConfigurationProfileType

    const params = {
      tenantId: 'tenant-id',
      profileId: 'b27ddd7be108495fb9175cec5930ce63',
      action: 'edit'
    }

    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={profileValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/regular/:profileId/:action' }
      })

    const profileNameInput = await screen.findByLabelText('Profile Name')
    fireEvent.change(profileNameInput, { target: { value: 'profiletest' } })
    fireEvent.blur(profileNameInput)
    expect(await screen.findByRole('img', { name: 'check-circle' })).toBeVisible()

    await userEvent.click(await screen.findByText('VLANs'))
    await screen.findByRole('heading', { level: 3, name: /VLANs/i })

    const applyButton = await screen.findByRole('button', { name: /Apply/i })
    await userEvent.click(applyButton)
  })
  it('Edit Switch Configuration Profile form with configuring trusted ports', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json(profilewithtp))
      )
    )
    const profileValues = {
      editMode: true,
      currentData: profilewithtp
    } as unknown as ConfigurationProfileType

    const params = {
      tenantId: 'tenant-id',
      profileId: 'b27ddd7be108495fb9175cec5930ce63',
      action: 'edit'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={profileValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/regular/:profileId/:action' }
      })

    const trustedPortsButton = await screen.findByRole('button', { name: 'Trusted Ports' })
    expect(trustedPortsButton).toBeInTheDocument()
    await userEvent.click(trustedPortsButton)

    const row = await screen.findByRole('row', { name: /ICX7150-24/i })
    expect(trustedPortsButton).toBeInTheDocument()
    await userEvent.click(row)
    const alertbar = await screen.findByRole('alert')
    expect(alertbar).toBeInTheDocument()
    await userEvent.click(await within(alertbar).findByText('Edit'))
    const trustedPortModal = await screen.findByTestId('trustedPortModal')
    expect(trustedPortModal).toBeVisible()
    const truestedPortButtons = await within(trustedPortModal).findByText('Trusted Ports')
    await userEvent.click(truestedPortButtons)
    const trustedPortsComboBox = await within(trustedPortModal).findByRole('combobox')
    await userEvent.click(trustedPortsComboBox)
    const optionValues = await screen.findAllByText('1/1/2')
    await userEvent.click(optionValues[1])
    const applyTrustedPortsButton =
      await within(trustedPortModal).findByText(/Apply/i)
    await userEvent.click(applyTrustedPortsButton)

    const applyButton = await screen.findByText(/Apply/i)
    await userEvent.click(applyButton)
  })

  it('Edit Switch Configuration Profile form with configuring voice vlan', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.BULK_VLAN_PROVISIONING)
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json(profileWithVoiceVlan))
      )
    )
    const profileValues = {
      editMode: true,
      currentData: profileWithVoiceVlan
    } as unknown as ConfigurationProfileType

    const params = {
      tenantId: 'tenant-id',
      profileId: 'd4e1e55cd0c44b5bb2d64d8aa0eeb3a1',
      action: 'edit'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={profileValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/regular/:profileId/:action' }
      })

    expect(await screen.findByRole('button', { name: 'Voice VLAN' })).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Voice VLAN' }))
    const tab = await screen.findByTestId('voice-vlan')
    within(tab).getByRole('heading', { level: 3, name: 'Voice VLAN' })

    await userEvent.click(await within(tab).findByRole('button', { name: 'Set Voice VLAN' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    const dialog1 = await screen.findByRole('dialog')
    const row = await within(dialog1).findByText(/13/)
    await userEvent.click(row)
    expect(await within(dialog1).findByRole('alert')).toBeInTheDocument()
    const alertbar = await within(dialog1).findByRole('alert')
    await userEvent.click(await within(alertbar).findByText('Edit'))
    const setDialog = await screen.findByRole('dialog', {
      name: /set voice vlan/i
    })
    await userEvent.click(within(setDialog).getByRole('button', {
      name: /set/i
    }))
    await waitFor(async () => expect(setDialog).not.toBeVisible())
    await userEvent.click(within(dialog1).getByRole('button', {
      name: /set/i
    }))
    await waitFor(async () => expect(dialog1).not.toBeVisible())
    const applyButton = await screen.findByRole('button', { name: /Apply/i })
    await userEvent.click(applyButton)
    await waitFor(() => expect(mockedUpdateFn).toBeCalled())
  })

  it('should render edit Switch Configuration Profile form correctly with rbac api', async () => {
    const params = {
      tenantId: 'tenant-id',
      profileId: 'profile-id',
      action: 'edit'
    }

    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.SWITCH_RBAC_API || ff === Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
    mockServer.use(
      rest.get(SwitchConfigTemplateUrlsInfo.getSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json(profile))
      ),
      rest.post(SwitchConfigTemplateUrlsInfo.getSwitchConfigProfileList.url,
        (_, res, ctx) => res(ctx.json({}))
      )
    )
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={{
          ...configureProfileContextValues,
          editMode: true
        }}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/regular/:profileId/:action' }
      })

    expect(await screen.findByText('Edit Switch Configuration Profile')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockNavigate).toHaveBeenCalledWith({
      hash: '', pathname: '/tenant-id/t/networks/wired/profiles', search: '' }, { replace: true }
    )
  })

  it('should render add Switch Configuration Profile form correctly with rbac api', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'add'
    }

    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.SWITCH_RBAC_API || ff === Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
    mockServer.use(
      rest.post(SwitchConfigTemplateUrlsInfo.getSwitchConfigProfileList.url,
        (_, res, ctx) => res(ctx.json({}))
      )
    )
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/:action' }
      })

    expect(await screen.findByText('Add Switch Configuration Profile')).toBeVisible()
    const profileNameInput = await screen.findByLabelText('Profile Name')
    fireEvent.change(profileNameInput, { target: { value: 'profiletest' } })
    const profileDescInput = await screen.findByLabelText('Profile Description')
    fireEvent.change(profileDescInput, { target: { value: 'profiledesc' } })
    fireEvent.blur(profileNameInput)
    expect(await screen.findByRole('img', { name: 'check-circle' })).toBeVisible()
  })

  describe('Edit mode', () => {
    const params = {
      tenantId: 'tenant-id',
      profileId: 'b27ddd7be108495fb9175cec5930ce63',
      action: 'edit'
    }

    it('should render Apply profile updates to existing switches button correctly', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.SWITCH_PROFILE_ONBOARD_ONLY
      )

      render(
        <Provider>
          <ConfigurationProfileFormContext.Provider value={{
            ...configureProfileContextValues,
            editMode: true
          }}>
            <ConfigurationProfileForm />
          </ConfigurationProfileFormContext.Provider>
        </Provider>, {
          // eslint-disable-next-line max-len
          route: { params, path: '/:tenantId/t/networks/wired/profiles/regular/:profileId/:action' }
        })

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      expect(await screen.findByText('Edit Switch Configuration Profile')).toBeVisible()
      expect(await screen.findByText(/General Properties/)).toBeVisible()
      fireEvent.blur(await screen.findByLabelText('Profile Name'))
      expect(await screen.findByRole('img', { name: 'check-circle' })).toBeVisible()

      await userEvent.click(await screen.findByText('Venues'))
      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })

      await screen.findByRole('heading', { level: 3, name: 'Venues' })
      await waitFor(async () => {
        expect(await screen.findAllByRole('row')).toHaveLength(11)
      })
      expect(await screen.findByText(/Apply profile updates to existing switches/)).toBeVisible()

      await userEvent.click(await screen.findByText('Summary'))
      await screen.findByRole('heading', { level: 3, name: /Summary/i })
      expect(await screen.findByText(/Apply profile updates to existing switches/)).toBeVisible()
    })
  })

  describe('Config template', () => {
    it('should render correctly with rbac api', async () => {
      const params = {
        tenantId: 'tenant-id',
        action: 'add'
      }

      mockServer.use(
        rest.post(ConfigTemplateUrlsInfo.getVenuesTemplateList.url,
          (_, res, ctx) => res(ctx.json(venues))
        ),
        rest.post(SwitchConfigTemplateUrlsInfo.getSwitchConfigProfileList.url,
          (_, res, ctx) => res(ctx.json({}))
        )
      )

      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.RBAC_CONFIG_TEMPLATE_TOGGLE
      )

      render(
        <Provider>
          <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
            <ConfigurationProfileForm />
          </ConfigurationProfileFormContext.Provider>
        </Provider>, {
          route: { params, path: '/:tenantId/t/networks/wired/profiles/:action' }
        })

      expect(await screen.findByText('Add Switch Configuration Profile')).toBeVisible()
      const profileNameInput = await screen.findByLabelText('Profile Name')
      fireEvent.change(profileNameInput, { target: { value: 'profiletest' } })
      const profileDescInput = await screen.findByLabelText('Profile Description')
      fireEvent.change(profileDescInput, { target: { value: 'profiledesc' } })
      fireEvent.blur(profileNameInput)
      expect(await screen.findByRole('img', { name: 'check-circle' })).toBeVisible()
    })

    it('should render venue table correctly', async () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
      const params = {
        tenantId: 'tenant-id',
        profileId: 'b27ddd7be108495fb9175cec5930ce63',
        action: 'edit'
      }

      mockServer.use(
        rest.post(ConfigTemplateUrlsInfo.getVenuesTemplateList.url,
          (_, res, ctx) => res(ctx.json(venues))
        ),
        rest.post(SwitchConfigTemplateUrlsInfo.getSwitchConfigProfileList.url,
          (_, res, ctx) => res(ctx.json({}))
        )
      )

      render(
        <Provider>
          <ConfigurationProfileFormContext.Provider value={{
            ...configureProfileContextValues,
            editMode: true
          }}>
            <ConfigurationProfileForm />
          </ConfigurationProfileFormContext.Provider>
        </Provider>, {
          // eslint-disable-next-line max-len
          route: { params, path: '/:tenantId/t/networks/wired/profiles/regular/:profileId/:action' }
        })

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      expect(await screen.findByText('Edit Switch Configuration Profile')).toBeVisible()
      expect(await screen.findByText(/General Properties/)).toBeVisible()
      fireEvent.blur(await screen.findByLabelText('Profile Name'))
      expect(await screen.findByRole('img', { name: 'check-circle' })).toBeVisible()

      await userEvent.click(await screen.findByText('Venues'))
      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })

      await screen.findByRole('heading', { level: 3, name: 'Venues' })
      await waitFor(async () => {
        expect(await screen.findAllByRole('row')).toHaveLength(11)
      })
    })

  })

  describe('RBAC', () => {
    describe('Edit mode', () => {
      const params = {
        tenantId: 'tenant-id',
        profileId: 'b27ddd7be108495fb9175cec5930ce63',
        action: 'edit'
      }

      beforeEach(() => {
        mockServer.use(
          rest.get(SwitchRbacUrlsInfo.getCliFamilyModels.url,
            (_, res, ctx) => res(ctx.json(familyModels))
          ),
          rest.put(SwitchRbacUrlsInfo.associateSwitchProfile.url,
            (_, res, ctx) => {
              mockedAssociate()
              return res(ctx.json({ requestId: 'request-id' }))
            }
          ),
          rest.delete(SwitchRbacUrlsInfo.disassociateSwitchProfile.url,
            (_, res, ctx) => {
              mockedDisassociate()
              return res(ctx.json({ requestId: 'request-id' }))
            }
          )
        )
      })

      it('should update correctly', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_RBAC_API)

        render(
          <Provider>
            <ConfigurationProfileFormContext.Provider value={{
              ...configureProfileContextValues,
              editMode: true
            }}>
              <ConfigurationProfileForm />
            </ConfigurationProfileFormContext.Provider>
          </Provider>, {
            // eslint-disable-next-line max-len
            route: { params, path: '/:tenantId/t/networks/wired/profiles/regular/:profileId/:action' }
          })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit Switch Configuration Profile')).toBeVisible()
        expect(await screen.findByText(/General Properties/)).toBeVisible()

        // await userEvent.click(await screen.findByText('Venues'))
        await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
        await waitFor(() => expect(mockedUpdateFn).toBeCalled())
        expect(mockedDisassociate).toHaveBeenCalledTimes(0)
        expect(mockedUpdateFn).toHaveBeenCalledTimes(1)
        expect(mockedAssociate).toHaveBeenCalledTimes(0)
      })

      it('should update and associate with switch correctly', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_RBAC_API)

        render(
          <Provider>
            <ConfigurationProfileFormContext.Provider value={{
              ...configureProfileContextValues,
              editMode: true
            }}>
              <ConfigurationProfileForm />
            </ConfigurationProfileFormContext.Provider>
          </Provider>, {
            // eslint-disable-next-line max-len
            route: { params, path: '/:tenantId/t/networks/wired/profiles/regular/:profileId/:action' }
          })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit Switch Configuration Profile')).toBeVisible()
        expect(await screen.findByText(/General Properties/)).toBeVisible()
        fireEvent.blur(await screen.findByLabelText('Profile Name'))
        expect(await screen.findByRole('img', { name: 'check-circle' })).toBeVisible()

        await userEvent.click(await screen.findByText('Venues'))
        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })

        await screen.findByRole('heading', { level: 3, name: 'Venues' })
        await waitFor(async () => {
          expect(await screen.findAllByRole('row')).toHaveLength(11)
        })

        const row = await screen.findByRole('row', { name: /My-Venue/i })
        await userEvent.click(await within(row).findByRole('checkbox'))
        expect(await screen.findByRole('alert')).toBeInTheDocument()
        const alertbar = await screen.findByRole('alert')
        await userEvent.click(await within(alertbar).findByText('Activate'))
        expect(await within(row).findByRole('switch')).toBeChecked()

        await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
        await waitFor(() => expect(mockedUpdateFn).toBeCalled())
        await waitFor(() => expect(mockedAssociate).toBeCalled())
        expect(mockedDisassociate).toHaveBeenCalledTimes(0)
        expect(mockedUpdateFn).toHaveBeenCalledTimes(1)
        expect(mockedAssociate).toHaveBeenCalledTimes(1)
      })

      it('should update and disassociate with switch correctly', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_RBAC_API)

        render(
          <Provider>
            <ConfigurationProfileFormContext.Provider value={{
              ...configureProfileContextValues,
              editMode: true
            }}>
              <ConfigurationProfileForm />
            </ConfigurationProfileFormContext.Provider>
          </Provider>, {
            // eslint-disable-next-line max-len
            route: { params, path: '/:tenantId/t/networks/wired/profiles/regular/:profileId/:action' }
          })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit Switch Configuration Profile')).toBeVisible()
        expect(await screen.findByText(/General Properties/)).toBeVisible()
        fireEvent.blur(await screen.findByLabelText('Profile Name'))
        expect(await screen.findByRole('img', { name: 'check-circle' })).toBeVisible()

        await userEvent.click(await screen.findByText('Venues'))
        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })

        await screen.findByRole('heading', { level: 3, name: 'Venues' })
        await waitFor(async () => {
          expect(await screen.findAllByRole('row')).toHaveLength(11)
        })

        const row = await screen.findByRole('row', { name: /testVenue/i })
        await userEvent.click(await within(row).findByRole('checkbox'))
        expect(await screen.findByRole('alert')).toBeInTheDocument()
        const alertbar = await screen.findByRole('alert')
        await userEvent.click(await within(alertbar).findByText('Deactivate'))
        expect(await within(row).findByRole('switch')).not.toBeChecked()

        await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
        await waitFor(() => expect(mockedDisassociate).toBeCalled())
        await waitFor(() => expect(mockedUpdateFn).toBeCalled())
        expect(mockedDisassociate).toHaveBeenCalledTimes(1)
        expect(mockedUpdateFn).toHaveBeenCalledTimes(1)
        expect(mockedAssociate).toHaveBeenCalledTimes(0)
      })
    })
  })

  describe('Bulk VLAN provisioning', () => {
    describe('Edit mode', () => {
      const params = {
        tenantId: 'tenant-id',
        profileId: 'b27ddd7be108495fb9175cec5930ce63',
        action: 'edit'
      }

      it('should show drawer correctly', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff === Features.SWITCH_RBAC_API
          || ff === Features.SWITCH_LEVEL_VLAN
          || ff === Features.BULK_VLAN_PROVISIONING
        )

        render(
          <Provider>
            <ConfigurationProfileFormContext.Provider value={{
              ...configureProfileContextValues,
              editMode: true
            }}>
              <ConfigurationProfileForm />
            </ConfigurationProfileFormContext.Provider>
          </Provider>, {
            // eslint-disable-next-line max-len
            route: { params, path: '/:tenantId/t/networks/wired/profiles/regular/:profileId/:action' }
          })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit Switch Configuration Profile')).toBeVisible()
        expect(await screen.findByText(/General Properties/)).toBeVisible()
        await userEvent.click(await screen.findByRole('button', { name: 'VLANs' }) )
        await userEvent.click(await screen.findByRole('button', { name: 'Add VLAN' }))
        expect(screen.queryByRole('button', { name: /Add Model/i })).toBeNull()
      })

      it('should add vlan correctly', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff === Features.SWITCH_RBAC_API
          || ff === Features.SWITCH_LEVEL_VLAN
          || ff === Features.BULK_VLAN_PROVISIONING
        )

        render(
          <Provider>
            <ConfigurationProfileFormContext.Provider value={{
              ...configureProfileContextValues,
              editMode: true
            }}>
              <ConfigurationProfileForm />
            </ConfigurationProfileFormContext.Provider>
          </Provider>, {
            // eslint-disable-next-line max-len
            route: { params, path: '/:tenantId/t/networks/wired/profiles/regular/:profileId/:action' }
          })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit Switch Configuration Profile')).toBeVisible()
        expect(await screen.findByText(/General Properties/)).toBeVisible()
        await userEvent.click(await screen.findByRole('button', { name: 'VLANs' }) )
        await userEvent.click(await screen.findByRole('button', { name: 'Add VLAN' }))

        await userEvent.type(await screen.findByLabelText('VLAN ID'), '10-12')
        await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
        expect(await screen.findByRole('row', { name: /11/i })).toBeVisible()
        expect(await screen.findByRole('row', { name: /12/i })).toBeVisible()
      })

      it('should update correctly', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff === Features.SWITCH_RBAC_API
          || ff === Features.SWITCH_LEVEL_VLAN
          || ff === Features.BULK_VLAN_PROVISIONING
        )

        render(
          <Provider>
            <ConfigurationProfileFormContext.Provider value={{
              ...configureProfileContextValues,
              editMode: true
            }}>
              <ConfigurationProfileForm />
            </ConfigurationProfileFormContext.Provider>
          </Provider>, {
            // eslint-disable-next-line max-len
            route: { params, path: '/:tenantId/t/networks/wired/profiles/regular/:profileId/:action' }
          })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit Switch Configuration Profile')).toBeVisible()
        expect(await screen.findByText(/General Properties/)).toBeVisible()
        expect(await screen.findByText(/Ports/)).toBeVisible()

        await userEvent.click(await screen.findByRole('button', { name: 'Ports' }) )
        expect(await screen.findByText(/Set Ports/)).toBeVisible()
        expect(await screen.findByText(/ICX7150-24/)).toBeVisible()
        expect(await screen.findByText(/Module/)).toBeVisible()
        expect(await screen.findByText(/Default/)).toBeVisible()

        await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
        await waitFor(() => expect(mockedUpdateFn).toHaveBeenCalledTimes(1))
      })

    })
  })
})