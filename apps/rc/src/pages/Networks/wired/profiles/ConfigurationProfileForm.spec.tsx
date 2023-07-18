import '@testing-library/jest-dom'
import userEvent    from '@testing-library/user-event'
import { Modal }    from 'antd'
import { debounce } from 'lodash'
import { rest }     from 'msw'

import { useIsSplitOn }                                           from '@acx-ui/feature-toggle'
import { switchApi, venueApi }                                    from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo }                         from '@acx-ui/rc/utils'
import { Provider, store }                                        from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { profilesExistResponse, familyModels, venues, profile, profilewithtp } from './__tests__/fixtures'
import { ConfigurationProfileForm }                                            from './ConfigurationProfileForm'
import { ConfigurationProfileFormContext, ConfigurationProfileType }           from './ConfigurationProfileFormContext'

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
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

describe('Wired', () => {
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.post(SwitchUrlsInfo.addSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.post(SwitchUrlsInfo.getSwitchProfileList.url,
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
        (_, res, ctx) => res(ctx.json({}))
      )
    )
  })

  afterEach(() => {
    Modal.destroyAll()
  })

  it('should render Switch Configuration Profile form correctly', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/add' }
      })

    const profileNameInput = await screen.findByLabelText('Profile Name')
    fireEvent.change(profileNameInput, { target: { value: 'profiletest' } })
    const profileDescInput = await screen.findByLabelText('Profile Description')
    fireEvent.change(profileDescInput, { target: { value: 'profiledesc' } })
    fireEvent.blur(profileNameInput)
    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
    })

    expect(await screen.findByText('Add Switch Configuration Profile')).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const params = {
      tenantId: 'tenant-id'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/add' }
      })

    expect(screen.getByRole('link', {
      name: /wired networks/i
    })).toBeTruthy()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = {
      tenantId: 'tenant-id'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/add' }
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

  it('should render create Switch Configuration Profile correctly', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/add' }
      })

    const profileNameInput = await screen.findByLabelText('Profile Name')
    fireEvent.change(profileNameInput, { target: { value: 'profiletest' } })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /VLANs/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Add VLAN' }))
    const vIdInput = await screen.findByLabelText('VLAN ID')
    fireEvent.change(vIdInput, { target: { value: '1' } })
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Default VLAN settings' }))
    const dvIdInput = await screen.findByLabelText('VLAN ID')
    fireEvent.change(dvIdInput, { target: { value: '1' } })
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /ACLs/i })
    await userEvent.click(await screen.findByRole('button', { name: 'Add ACL' }))
    const aclNameInput = await screen.findByLabelText('ACL Name')
    fireEvent.change(aclNameInput, { target: { value: '1' } })
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Venues/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Summary/i })

    await userEvent.click(await screen.findByRole('button', { name: /Finish/i }) )
  })

  it('should render Switch Configuration Profile form with VLAN correctly', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/add' }
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

    await userEvent.click(await within(vlanSettingModal).findByTestId('untagged_module1_0'))
    const nextTrustPortButton1 =
      await within(vlanSettingModal).findByRole('button', { name: 'Next' })
    await userEvent.click(nextTrustPortButton1)

    await userEvent.click(await within(vlanSettingModal).findByTestId('tagged_module1_2'))
    const saveTrustPortButton =
      await within(vlanSettingModal).findAllByRole('button', { name: 'Finish' })
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

  it('should render Profile form with drag select VLAN ports correctly', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/add' }
      })

    const profileNameInput = await screen.findByLabelText('Profile Name')
    fireEvent.change(profileNameInput, { target: { value: 'profiletest' } })

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

    const dst = await screen.findAllByTestId('untagged_module1_0')
    const src = await screen.findAllByTestId('untagged_module1_10')
    fireEvent.mouseDown(src[0])
    fireEvent.mouseMove(dst[0])
    debounce(() => {
      fireEvent.mouseUp(dst[0])
    }, 100)
    const nextTrustPortButton1 = await within(dialog).findByRole('button', { name: 'Next' })
    await userEvent.click(nextTrustPortButton1)

    await userEvent.click(await within(dialog).findByTestId('tagged_module1_20'))
    const saveTrustPortButton = await within(dialog).findAllByRole('button', { name: 'Finish' })
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

  it('should render create Switch Configuration Profile with extended acl correctly', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/add' }
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
    await userEvent.click(await screen.findByRole('button', { name: 'Activate' }) )
  })

  it.skip('should create Switch Configuration Profile with trust ports correctly', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/add' }
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

    await userEvent.click(await screen.findByTestId('untagged_module1_0'))
    await userEvent.click(await screen.findByTestId('untagged_module2_0'))
    await userEvent.click(await screen.findByTestId('untagged_module3_0'))
    const nextVlansPortButton2 =
      await within(vlansPortModal).findByRole('button', { name: 'Next' })
    await userEvent.click(nextVlansPortButton2)
    await userEvent.click(await screen.findByTestId('tagged_module1_1'))
    await userEvent.click(await screen.findByTestId('tagged_module2_1'))
    await userEvent.click(await screen.findByTestId('tagged_module3_1'))
    const nextVlansPortButton3 =
      await within(vlansPortModal).findByRole('button', { name: 'Finish' })
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

    await userEvent.click(await screen.findByRole('button', { name: 'Finish' }) )
  })

  it('should create Switch Configuration Profile with trust ports ICX7550 correctly', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/add' }
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
      await within(trustedPortModal).findByRole('button', { name: 'Finish' })
    await userEvent.click(saveTrustPortButton)
  })
  it('Edit Switch Configuration Profile form with empty trusted ports', async () => {
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

    await userEvent.click(await screen.findByText('VLANs'))
    await screen.findByRole('heading', { level: 3, name: /VLANs/i })

    await userEvent.click(await screen.findByRole('button', { name: /Add VLAN/i }))
    const vIdInput = await screen.findByLabelText('VLAN ID')
    fireEvent.change(vIdInput, { target: { value: '2' } })
    await userEvent.click((await screen.findByTestId('dhcpSnooping')))
    await userEvent.click((await screen.findByTestId('arpInspection')))
    await userEvent.click(await screen.findByRole('button', { name: 'Add Model' }))
    const vlansPortModal = await screen.findByTestId('vlanSettingModal')
    const family = await within(vlansPortModal).findByTestId('ICX7150')
    await userEvent.click(family)
    const model = await within(vlansPortModal).findByTestId('48')
    await userEvent.click(model)
    const nextVlansPortButton1 =
      await within(vlansPortModal).findByRole('button', { name: 'Next' })
    await userEvent.click(nextVlansPortButton1)

    await userEvent.click(await screen.findByTestId('untagged_module1_0'))
    const nextVlansPortButton2 =
      await within(vlansPortModal).findByRole('button', { name: 'Next' })
    await userEvent.click(nextVlansPortButton2)
    const nextVlansPortButton3 =
      await within(vlansPortModal).findByRole('button', { name: 'Finish' })
    await userEvent.click(nextVlansPortButton3)

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }) )

    const applyButton = await screen.findByRole('button', { name: /Apply/i })
    await userEvent.click(applyButton)

    await waitFor(async () => expect(await screen.findByText('Error')).toBeVisible())
  })
})