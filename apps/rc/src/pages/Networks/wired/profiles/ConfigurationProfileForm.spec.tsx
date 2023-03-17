import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { switchApi, venueApi }                                    from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo }                         from '@acx-ui/rc/utils'
import { Provider, store }                                        from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { profilesExistResponse, familyModels, venues, profile }      from './__tests__/fixtures'
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
      rest.get(CommonUrlsInfo.getSwitchConfigProfile.url,
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
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
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
        route: { params, path: '/:tenantId/networks/wired/profiles/regular/:profileId/:action' }
      })

    expect(await screen.findByText('Edit Switch Configuration Profile')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
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
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
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

  xit('should render create Switch Configuration Profile with trust ports correctly', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
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
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /ACLs/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Trusted Ports/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Add Model' }))
    const trustedPortModal = await screen.findByTestId('trustedPortModal')
    const family = await within(trustedPortModal).findByTestId('ICX7150')
    await userEvent.click(family)
    const model = await within(trustedPortModal).findByTestId('24')
    await userEvent.click(model)
    const nextTrustPortButton =
      await within(trustedPortModal).findByRole('button', { name: 'Next' })
    await userEvent.click(nextTrustPortButton)

    fireEvent.change(await within(trustedPortModal).findByRole('combobox'), {
      target: { value: '1/1/1' }
    })
    fireEvent.keyPress(await within(trustedPortModal).findByRole('combobox'),
      { key: 'Enter', code: 13, charCode: 13 })
    const saveTrustPortButton =
      await within(trustedPortModal).findAllByRole('button', { name: 'Finish' })
    await userEvent.click(saveTrustPortButton[0])

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

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Summary/i })

    const finishButton = await screen.findAllByRole('button', { name: /Finish/i })
    await userEvent.click(finishButton[1])
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
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
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
        route: { params, path: '/:tenantId/networks/wired/profiles/regular/:profileId/:action' }
      })

    const profileNameInput = await screen.findByLabelText('Profile Name')
    fireEvent.change(profileNameInput, { target: { value: 'profiletest' } })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /VLANs/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /ACLs/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Venues/i })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Summary/i })

    const finishButton = await screen.findByRole('button', { name: /Finish/i })
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
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
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
    fireEvent.dragStart(src[0])
    fireEvent.dragEnter(src[0])
    await new Promise((resolve) => setTimeout(resolve, 100))
    fireEvent.drop(dst[0])
    fireEvent.dragLeave(dst[0])
    fireEvent.dragEnd(dst[0])
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
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
      })

    const profileNameInput = await screen.findByLabelText('Profile Name')
    fireEvent.change(profileNameInput, { target: { value: 'profiletest' } })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /VLANs/ })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /ACLs/ })
    await userEvent.click(await screen.findByRole('button', { name: 'Add ACL' }))
    const aclNameInput = await screen.findByLabelText('ACL Name')
    fireEvent.change(aclNameInput, { target: { value: '100' } })
    const extendedOption = await screen.findByTestId('aclExtended')
    await userEvent.click(extendedOption)
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Venues/ })
    const venueSwitch = await screen.findAllByRole('switch')
    await userEvent.click(venueSwitch[0])
    await userEvent.click(venueSwitch[1])
    await userEvent.click(venueSwitch[0])

    const venueCheckbox = await screen.findAllByRole('checkbox')
    await userEvent.click(venueCheckbox[0])
    await userEvent.click(await screen.findByRole('button', { name: 'Deactivate' }) )
    await userEvent.click(await screen.findByRole('button', { name: 'Activate' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Summary/ })

    await userEvent.click(await screen.findByRole('button', { name: /Finish/ }) )
  })
})