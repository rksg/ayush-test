import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, SwitchUrlsInfo }                from '@acx-ui/rc/utils'
import { Provider }                                      from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, within } from '@acx-ui/test-utils'

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
    mockServer.use(
      rest.post(SwitchUrlsInfo.addSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(SwitchUrlsInfo.getSwitchProfileList.url,
        (_, res, ctx) => res(ctx.json(profilesExistResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venues))),
      rest.get(SwitchUrlsInfo.getCliFamilyModels.url,
        (_, res, ctx) => res(ctx.json(familyModels))),
      rest.get(CommonUrlsInfo.getSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json(profile)))
    )
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

    expect(await screen.findByText('Add Switch Configuration Profile')).toBeVisible()

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
    const profileDescInput = await screen.findByLabelText('Profile Description')
    fireEvent.change(profileDescInput, { target: { value: 'profiledesc' } })
    fireEvent.blur(profileNameInput)
    await screen.findByRole('img', { name: 'loading' })
    await screen.findByRole('img', { name: 'check-circle' })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /VLANs/ })

    fireEvent.click(await screen.findByRole('button', { name: 'Add VLAN' }))
    const vIdInput = await screen.findByLabelText('VLAN ID')
    fireEvent.change(vIdInput, { target: { value: '1' } })
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }) )

    fireEvent.click(await screen.findByRole('button', { name: 'Default VLAN settings' }))
    const dvIdInput = await screen.findByLabelText('VLAN ID')
    fireEvent.change(dvIdInput, { target: { value: '1' } })
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /ACLs/ })
    fireEvent.click(await screen.findByRole('button', { name: 'Add ACL' }))
    const aclNameInput = await screen.findByLabelText('ACL Name')
    fireEvent.change(aclNameInput, { target: { value: '1' } })
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Venues/ })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Summary/ })

    await userEvent.click(await screen.findByRole('button', { name: /Finish/ }) )
  })

  it('should render create Switch Configuration Profile with trust ports correctly', async () => {
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
    await screen.findByRole('img', { name: 'loading' })
    await screen.findByRole('img', { name: 'check-circle' })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /VLANs/ })

    fireEvent.click(await screen.findByRole('button', { name: 'Add VLAN' }))
    const vIdInput = await screen.findByLabelText('VLAN ID')
    fireEvent.change(vIdInput, { target: { value: '1' } })
    await userEvent.click((await screen.findByTestId('dhcpSnooping')))
    await userEvent.click((await screen.findByTestId('arpInspection')))
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /ACLs/ })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Trusted Ports/ })

    fireEvent.click(await screen.findByRole('button', { name: 'Add Model' }))
    const dialog = await screen.findByRole('dialog')
    const family = await screen.findByText('ICX-7150')
    await userEvent.click(family)
    const model = await screen.findByText('24')
    await userEvent.click(model)
    const nextTrustPortButton = await within(dialog).findByRole('button', { name: 'Next' })
    await userEvent.click(nextTrustPortButton)

    fireEvent.change(await within(dialog).findByRole('combobox'), {
      target: { value: '1/1/1' }
    })
    const saveTrustPortButton = await within(dialog).findAllByRole('button', { name: 'Finish' })
    await userEvent.click(saveTrustPortButton[0])

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Venues/ })

    const venueSwitch = await screen.findAllByRole('switch')
    await userEvent.click(venueSwitch[0])

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Summary/ })

    const finishButton = await screen.findAllByRole('button', { name: /Finish/ })
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
    const profileDescInput = await screen.findByLabelText('Profile Description')
    fireEvent.change(profileDescInput, { target: { value: 'profiledesc' } })
    fireEvent.change(profileDescInput, { target: { value: 'profiledesc' } })
    fireEvent.blur(profileNameInput)
    await screen.findByRole('img', { name: 'loading' })
    await screen.findByRole('img', { name: 'check-circle' })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /VLANs/ })

    fireEvent.click(await screen.findByRole('button', { name: 'Add VLAN' }))
    const vIdInput = await screen.findByLabelText('VLAN ID')
    fireEvent.change(vIdInput, { target: { value: '1' } })

    fireEvent.click(await screen.findByRole('button', { name: 'Add Model' }))
    const dialog = await screen.findAllByRole('dialog')
    const family = await screen.findByText('ICX-7150')
    await userEvent.click(family)
    const model = await screen.findByText('24')
    await userEvent.click(model)
    const nextTrustPortButton = await within(dialog[1]).findByRole('button', { name: 'Next' })
    await userEvent.click(nextTrustPortButton)

    await userEvent.click(await within(dialog[1]).findByTestId('untagged_module1_0'))
    const nextTrustPortButton1 = await within(dialog[1]).findByRole('button', { name: 'Next' })
    await userEvent.click(nextTrustPortButton1)

    await userEvent.click(await within(dialog[1]).findByTestId('tagged_module1_2'))
    const saveTrustPortButton = await within(dialog[1]).findAllByRole('button', { name: 'Finish' })
    await userEvent.click(saveTrustPortButton[0])

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /ACLs/ })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Venues/ })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Summary/ })

    const finishButton = await screen.findAllByRole('button', { name: /Finish/ })
    await userEvent.click(finishButton[1])
  })

  it('should edit Switch Configuration Profile form', async () => {
    const profileValues = {
      editMode: true,
      currentData: profile
    } as unknown as ConfigurationProfileType

    const params = {
      tenantId: 'tenant-id',
      profileId: 'b27ddd7be108495fb9175cec5930ce63'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={profileValues}>
          <ConfigurationProfileForm />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:profileId/edit' }
      })

    const profileNameInput = await screen.findByLabelText('Profile Name')
    fireEvent.change(profileNameInput, { target: { value: 'profiletest' } })
    const profileDescInput = await screen.findByLabelText('Profile Description')
    fireEvent.change(profileDescInput, { target: { value: 'profiledesc' } })
    fireEvent.change(profileDescInput, { target: { value: 'profiledesc' } })
    fireEvent.blur(profileNameInput)
    await screen.findByRole('img', { name: 'loading' })
    await screen.findByRole('img', { name: 'check-circle' })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /VLANs/ })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /ACLs/ })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Venues/ })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Summary/ })

    const finishButton = await screen.findByRole('button', { name: /Finish/ })
    await userEvent.click(finishButton)
  })



  it('should render Configuration Profile form with drag select VLAN ports correctly', async () => {
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
    fireEvent.change(profileDescInput, { target: { value: 'profiledesc' } })
    fireEvent.blur(profileNameInput)
    await screen.findByRole('img', { name: 'loading' })
    await screen.findByRole('img', { name: 'check-circle' })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /VLANs/ })

    fireEvent.click(await screen.findByRole('button', { name: 'Add VLAN' }))
    const vIdInput = await screen.findByLabelText('VLAN ID')
    fireEvent.change(vIdInput, { target: { value: '1' } })

    fireEvent.click(await screen.findByRole('button', { name: 'Add Model' }))
    const dialog = await screen.findAllByRole('dialog')
    const family = await screen.findByText('ICX-7150')
    await userEvent.click(family)
    const model = await screen.findByText('24')
    await userEvent.click(model)
    const nextTrustPortButton = await within(dialog[1]).findByRole('button', { name: 'Next' })
    await userEvent.click(nextTrustPortButton)

    const dst = await screen.findAllByTestId('untagged_module1_0')
    const src = await screen.findAllByTestId('untagged_module1_10')
    fireEvent.dragStart(src[0])
    fireEvent.dragEnter(src[0])
    await new Promise((resolve) => setTimeout(resolve, 100))
    fireEvent.drop(dst[0])
    fireEvent.dragLeave(dst[0])
    fireEvent.dragEnd(dst[0])
    const nextTrustPortButton1 = await within(dialog[1]).findByRole('button', { name: 'Next' })
    await userEvent.click(nextTrustPortButton1)

    await userEvent.click(await within(dialog[1]).findByTestId('tagged_module1_20'))
    const saveTrustPortButton = await within(dialog[1]).findAllByRole('button', { name: 'Finish' })
    await userEvent.click(saveTrustPortButton[0])

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /ACLs/ })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Venues/ })

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }) )
    await screen.findByRole('heading', { level: 3, name: /Summary/ })

    const finishButton = await screen.findAllByRole('button', { name: /Finish/ })
    await userEvent.click(finishButton[1])
  })
})
