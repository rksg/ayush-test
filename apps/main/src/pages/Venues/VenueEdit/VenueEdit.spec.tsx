import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { venueApi }                                                                          from '@acx-ui/rc/services'
import { CommonUrlsInfo }                                                                    from '@acx-ui/rc/utils'
import { Provider, store }                                                                   from '@acx-ui/store'
import { render, screen, fireEvent, mockServer, waitFor, within, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  configProfiles,
  switchConfigProfile,
  venueApModels,
  venueCaps,
  venueData,
  venueLanPorts,
  venueLed,
  venueSwitchSetting
} from '../__tests__/fixtures'

import { VenueEdit } from './index'

window.scrollTo = jest.fn()

async function showInvalidChangesModal (tabKey, discard) {
  const dialog = await screen.findByRole('dialog')
  await screen.findByText('You Have Invalid Changes')
  await screen.findByText(`Do you want to discard your changes in "${tabKey}"?`)
  fireEvent.click(
    within(dialog).getAllByRole('button', { name: discard ? 'Discard Changes' : 'Cancel' })[0]
  )
}

async function showUnsavedChangesModal (tabKey, discard) {
  await screen.findByRole('dialog')
  await screen.findByText('You Have Unsaved Changes')
  await screen.findByText
  (`Do you want to save your changes in "${tabKey}", or discard all changes?`)
  fireEvent.click(
    await screen.findByRole('button', { name: discard ? 'Discard Changes' : 'Save Changes' })
  )
}

async function updateAdvancedSettings (selectModel) {
  await screen.findByText('E510')
  fireEvent.click( screen.getByRole('button', { name: 'Add Model' }))
  if (selectModel) {
    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const option = screen.getAllByText('H320')
    await userEvent.click(option[1])
  }
  const toggle = screen.getAllByRole('switch')
  fireEvent.click(toggle[0])
}

async function updateLanPorts () {
  const view = screen.getByTestId('apModelSelect')
  fireEvent.mouseDown(within(view).getByText(/no model selected/i))
  const option = screen.getByText('T750')
  await userEvent.click(option)
  expect(await screen.findByAltText(/AP LAN port image - T750/)).toBeVisible()

  fireEvent.mouseDown(screen.getByLabelText('PoE Operating Mode'))
  await userEvent.click(await screen.getAllByText('802.3at')[1])
}
async function updateMeshNetwork () {
  fireEvent.click(await screen.getAllByText('Mesh Network')[0]) // anchor
  await userEvent.click(screen.getByTestId('mesh-switch'))
  await userEvent.click(await screen.findByRole('button', { name: 'Enable Mesh' }))
}

describe('VenueEdit - handle unsaved/invalid changes modal', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(CommonUrlsInfo.getVenueCapabilities.url,
        (_, res, ctx) => res(ctx.json(venueCaps))),
      rest.get(CommonUrlsInfo.getVenueLedOn.url,
        (_, res, ctx) => res(ctx.json(venueLed))),
      rest.put(CommonUrlsInfo.updateVenueLedOn.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(CommonUrlsInfo.getVenueApModels.url,
        (_, res, ctx) => res(ctx.json(venueApModels))),
      rest.get(CommonUrlsInfo.getVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json(venueLanPorts))),
      rest.put(CommonUrlsInfo.updateVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(CommonUrlsInfo.getConfigProfiles.url,
        (_, res, ctx) => res(ctx.json({ data: configProfiles } ))),
      rest.get(CommonUrlsInfo.getVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json(venueSwitchSetting[0]))),
      rest.put(CommonUrlsInfo.updateVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.put(CommonUrlsInfo.updateVenueMesh.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(CommonUrlsInfo.getSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json(switchConfigProfile[0])))
    )
  })

  describe('General', () => {
    const params = {
      tenantId: 'tenant-id',
      venueId: 'venue-id',
      activeTab: 'switch',
      activeSubTab: 'general'
    }
    afterEach(() => Modal.destroyAll())

    it('should open unsaved changes modal', async () => {
      jest.mock('react', () => ({
        ...jest.requireActual('react'),
        useRef: jest.fn(() => ({
          current: jest.fn(() => null)
        }))
      }))
      render(<Provider><VenueEdit /></Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
      await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
      await waitFor(() => screen.findByText('profile01 (Regular)'))

      fireEvent.click(screen.getByRole('button', { name: 'Change' }))
      fireEvent.click(await screen.findByText('No Profile'))
      fireEvent.click(screen.getByRole('button', { name: 'OK' }))
      expect(await screen.findByText('No Profile is selected')).toBeVisible()

      fireEvent.click(await screen.findByText('Back to venue details'))
      await showUnsavedChangesModal('General', false)
    })
  })

  describe('Advanced Settings', () => {
    const params = {
      tenantId: 'tenant-id',
      venueId: 'venue-id',
      activeTab: 'wifi',
      activeSubTab: 'settings'
    }
    beforeEach(async () => {
      jest.mock('react', () => ({
        ...jest.requireActual('react'),
        useRef: jest.fn(() => ({
          current: jest.fn(() => null)
        }))
      }))
    })
    afterEach(() => Modal.destroyAll())

    it('should open invalid changes modal', async () => {
      render(<Provider><VenueEdit /></Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
      await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
      await updateAdvancedSettings(false)
      fireEvent.click(await screen.findByText('Back to venue details'))
      await showInvalidChangesModal('Advanced Settings', true)
    })
    it('should open invalid changes modal and handle changes discarded', async () => {
      render(<Provider><VenueEdit /></Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
      await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
      await updateAdvancedSettings(false)
      fireEvent.click(await screen.findByText('Back to venue details'))
      await showInvalidChangesModal('Advanced Settings', false)
    })
    it('should open unsaved changes modal', async () => {
      render(<Provider><VenueEdit /></Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
      await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
      await updateAdvancedSettings(true)
      fireEvent.click(await screen.findByText('Back to venue details'))
      await showUnsavedChangesModal('Advanced Settings', false)
    })
  })

  describe('Networking', () => {
    const params = {
      tenantId: 'tenant-id',
      venueId: 'venue-id',
      activeTab: 'wifi',
      activeSubTab: 'networking'
    }
    beforeEach(async () => {
      jest.mock('react', () => ({
        ...jest.requireActual('react'),
        useRef: jest.fn(() => ({
          current: jest.fn(() => null)
        }))
      }))
    })
    afterEach(() => {
      Modal.destroyAll()
    })
    it('should open unsaved changes modal and handle changes discarded', async () => {
      render(<Provider><VenueEdit /></Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
      await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
      await waitFor(() => screen.findByText('AP Model'))
      await updateLanPorts()
      await updateMeshNetwork()
      fireEvent.click(await screen.findByText('Back to venue details'))
      await showUnsavedChangesModal('Networking', false)
    })
    it('should open unsaved changes modal and handle changes saved', async () => {
      render(<Provider><VenueEdit /></Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
      await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
      await waitFor(() => screen.findByText('AP Model'))
      await updateMeshNetwork()
      fireEvent.click(await screen.findByText('Back to venue details'))
      await showUnsavedChangesModal('Networking', true)
    })
  })
})
