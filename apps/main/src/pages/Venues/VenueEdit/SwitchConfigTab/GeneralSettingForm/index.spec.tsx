import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'


import { venueApi }                                                                          from '@acx-ui/rc/services'
import { CommonUrlsInfo }                                                                    from '@acx-ui/rc/utils'
import { Provider, store }                                                                   from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, within, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  successResponse,
  configProfiles,
  venueSwitchSetting,
  switchConfigProfile
} from '../../../__tests__/fixtures'
import { VenueEditContext, EditContext } from '../../index'

import { GeneralSettingForm } from './index'

let editContextData = {} as EditContext
const setEditContextData = jest.fn()

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
const params = { venueId: 'venue-id', tenantId: 'tenant-id' }

describe('GeneralSettingForm', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.post(CommonUrlsInfo.getConfigProfiles.url,
        (_, res, ctx) => res(ctx.json({ data: configProfiles } ))),
      rest.get(CommonUrlsInfo.getVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json(venueSwitchSetting[0]))),
      rest.put(CommonUrlsInfo.updateVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(CommonUrlsInfo.getSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json(switchConfigProfile[0])))
    )
  })

  it('should render correctly', async () => {
    const { asFragment } = render(
      <Provider>
        <VenueEditContext.Provider value={{ editContextData, setEditContextData }}>
          <GeneralSettingForm />
        </VenueEditContext.Provider>
      </Provider>, { route: { params } }
    )
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('profile01 (Regular)'))
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render regular profile details correctly', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json(venueSwitchSetting[2]))),
      rest.get(CommonUrlsInfo.getSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json(switchConfigProfile[1])))
    )

    render(<Provider>
      <VenueEditContext.Provider value={{ editContextData, setEditContextData }}>
        <GeneralSettingForm />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('profile02 (Regular)'))

    fireEvent.click(screen.getByRole('button', { name: 'View Details' }))
    expect(await screen.findByText('VLANs (1)')).toBeVisible()
    expect(await screen.findByText('test-vlan')).toBeVisible()
    expect(await screen.findByText('ACLs (1)')).toBeVisible()
    expect(await screen.findByText('test-acl')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
  })

  it('should handle regular profile change', async () => {
    render(<Provider>
      <VenueEditContext.Provider value={{ editContextData, setEditContextData }}>
        <GeneralSettingForm />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('profile01 (Regular)'))

    fireEvent.click(screen.getByRole('button', { name: 'View Details' }))
    expect(await screen.findByText('VLANs (0)')).toBeVisible()
    expect(await screen.findByText('ACLs (0)')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.click(await screen.findByText('No Profile'))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(await screen.findByText('No Profile is selected')).toBeVisible()
  })

  it('should render CLI profile details correctly', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json(venueSwitchSetting[1])))
    )
    render(<Provider>
      <VenueEditContext.Provider value={{ editContextData, setEditContextData }}>
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
      <VenueEditContext.Provider value={{ editContextData, setEditContextData }}>
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

  it('should handle DNS update', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json(venueSwitchSetting[1])))
    )
    render(<Provider>
      <VenueEditContext.Provider value={{ editContextData, setEditContextData }}>
        <GeneralSettingForm />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('2 CLI profiles selected'))

    fireEvent.click(screen.getByRole('button', { name: 'Add IP Address' }))
    // TODO: add test for edit dns

    const deleteBtns = screen.getAllByRole('deleteBtn')
    expect(deleteBtns).toHaveLength(2)
    fireEvent.click(deleteBtns[1])
  })

  it('should handle Syslog Server change and setting update', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json(venueSwitchSetting[1])))
    )
    render(<Provider>
      <VenueEditContext.Provider value={{ editContextData, setEditContextData }}>
        <GeneralSettingForm />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('2 CLI profiles selected'))

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

  it('should navigate to venue details page when clicking cancel button', async () => {
    render(<Provider>
      <VenueEditContext.Provider value={{ editContextData, setEditContextData }}>
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
      pathname: `/t/${params.tenantId}/venues/${params.venueId}/venue-details/overview`,
      hash: '',
      search: ''
    })
  })
})
