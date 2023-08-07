import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi, policyApi }                                                               from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo, SyslogUrls, WifiUrlsInfo }                          from '@acx-ui/rc/utils'
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
  venueSwitchSetting,
  venueExternalAntenna,
  syslogServerProfiles
} from '../__tests__/fixtures'

import { VenueEdit } from './index'

window.scrollTo = jest.fn()

jest.mock('./SwitchConfigTab/SwitchAAATab/SwitchAAATab', () => ({
  SwitchAAATab: () => <div data-testid='SwitchAAATab' />
}))
jest.mock('./WifiConfigTab/NetworkingTab/DirectedMulticast', () => () => {
  return <div data-testid='DirectedMulticast' />
})
jest.mock('./WifiConfigTab/NetworkingTab/CellularOptions/CellularOptionsForm', () => ({
  CellularOptionsForm: () => <div data-testid='CellularOptionsForm' />
}))

jest.mock('./WifiConfigTab/RadioTab/RadioSettings', () => ({
  RadioSettings: () => <div data-testid='RadioSettings' />
}))
jest.mock('./WifiConfigTab/RadioTab/ClientAdmissionControl', () => ({
  ClientAdmissionControl: () => <div data-testid='ClientAdmissionControl' />
}))
jest.mock('./WifiConfigTab/RadioTab/LoadBalancing', () => ({
  LoadBalancing: () => <div data-testid='LoadBalancing' />
}))
jest.mock('./WifiConfigTab/ServerTab/MdnsFencing/MdnsFencing', () => () => {
  return <div data-testid='MdnsFencing' />
})
jest.mock('./WifiConfigTab/ServerTab/ApSnmp', () => () => {
  return <div data-testid='ApSnmp' />
})

const onOk = jest.fn()
// jest.spyOn(CommonComponent, 'showActionModal').mockImplementation((props: ModalProps) => {
//   const modal = Modal.confirm({})
//   const config = CommonComponent.transformProps({
//     ...props,
//     customContent: {
//       action: 'CUSTOM_BUTTONS',
//       buttons: props?.customContent?.buttons?.map(b => {
//         return {
//           ...b,
//           closeAfterAction: true,
//           handler: b.key !== 'close' ? async () => {
//             await b.handler()
//             onOk()
//           } : b.handler
//         }
//       })
//     }
//   }, modal)
//   modal.update({
//     ...config,
//     content: <RawIntlProvider value={getIntl()} children={config.content} />,
//     icon: <> </>
//   })
//   return pick(modal, 'destroy')
// })

let dialog = null
const buttonAction = {
  DISCARD_CHANGES: 'Discard Changes',
  SAVE_CHANGES: 'Save Changes',
  CANCEL: 'Cancel'
}

async function showInvalidChangesModal (tabKey: string, action: string) {
  dialog = await screen.findByRole('dialog')
  await screen.findByText('You Have Invalid Changes')
  await screen.findByText(`Do you want to discard your changes in "${tabKey}"?`)
  fireEvent.click(
    within(dialog).getAllByRole('button', { name: action })[0]
  )

  await waitFor(async () => {
    expect(screen.queryAllByRole('dialog')).toHaveLength(0)
  })
  expect(dialog).not.toBeVisible()
  dialog = null
}

async function showUnsavedChangesModal (tabKey: string, action: string) {
  dialog = await screen.findByRole('dialog')
  await screen.findByText('You Have Unsaved Changes')
  await screen.findByText
  (`Do you want to save your changes in "${tabKey}", or discard all changes?`)
  fireEvent.click(
    await within(dialog).getAllByRole('button', { name: action })[0]
  )

  await waitFor(async () => {
    expect(screen.queryAllByRole('dialog')).toHaveLength(0)
  })
  expect(dialog).not.toBeVisible()
  dialog = null
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
}

async function updateSyslogServer () {
  expect(await screen.findByTestId('syslog-switch')).not.toBeChecked()

  fireEvent.click(await screen.findByTestId('syslog-switch'))
  await waitFor(async () => {
    expect(await screen.findByTestId('syslog-switch')).toBeChecked()
  })
}

describe('VenueEdit - handle unsaved/invalid changes modal', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(WifiUrlsInfo.getVenueApCapabilities.url,
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
      rest.get(SwitchUrlsInfo.getSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json(switchConfigProfile[0]))),
      rest.get(SyslogUrls.getSyslogPolicyList.url,
        (_, res, ctx) => res(ctx.json(syslogServerProfiles)))
    )
  })

  afterEach(async () => {
    onOk.mockClear()
  })

  describe('Switch Configuration', () => {
    describe('General', () => {
      const params = {
        tenantId: 'tenant-id',
        venueId: 'venue-id',
        activeTab: 'switch',
        activeSubTab: 'general'
      }

      it('should open unsaved changes modal', async () => {
        render(<Provider><VenueEdit /></Provider>, {
          route: { params, path: '/:tenantId/t/venues/:venueId/edit/:activeTab/:activeSubTab' }
        })
        await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
        await waitFor(() => screen.findByText('profile01 (Regular)'))

        fireEvent.click(screen.getByRole('button', { name: 'Change' }))
        fireEvent.click(await screen.findByText('No Profile'))
        fireEvent.click(screen.getByRole('button', { name: 'OK' }))
        expect(await screen.findByText('No Profile is selected')).toBeVisible()

        expect(await screen.findByRole('tab', { name: 'General *' })).toBeVisible()
        fireEvent.click(await screen.findByRole('tab', { name: 'AAA' }))
        await showUnsavedChangesModal('General', buttonAction.CANCEL)

        fireEvent.click(await screen.findByRole('tab', { name: 'AAA' }))
        await showUnsavedChangesModal('General', buttonAction.DISCARD_CHANGES)
      })

      it('should open unsaved changes modal when switching tab', async () => {
        render(<Provider><VenueEdit /></Provider>, {
          route: { params, path: '/:tenantId/t/venues/:venueId/edit/:activeTab/:activeSubTab' }
        })
        await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
        await waitFor(() => screen.findByText('profile01 (Regular)'))

        fireEvent.click(screen.getByRole('button', { name: 'Change' }))
        fireEvent.click(await screen.findByText('No Profile'))
        fireEvent.click(screen.getByRole('button', { name: 'OK' }))
        expect(await screen.findByText('No Profile is selected')).toBeVisible()

        fireEvent.click(await screen.findByRole('tab', { name: 'AAA' }))
        await showUnsavedChangesModal('General', buttonAction.DISCARD_CHANGES)
      })
    })
  })

  describe('Wi-Fi Configuration', () => {
    describe('Advanced Settings', () => {
      const params = {
        tenantId: 'tenant-id',
        venueId: 'venue-id',
        activeTab: 'wifi',
        activeSubTab: 'settings'
      }

      it('should open invalid changes modal', async () => {
        render(<Provider><VenueEdit /></Provider>, {
          route: { params, path: '/:tenantId/t/venues/:venueId/edit/:activeTab/:activeSubTab' }
        })
        await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
        await updateAdvancedSettings(false)
        fireEvent.click(await screen.findByText('Back to venue details'))
        await showInvalidChangesModal('Advanced Settings', buttonAction.CANCEL)
      })
      it('should open invalid changes modal and handle changes discarded', async () => {
        render(<Provider><VenueEdit /></Provider>, {
          route: { params, path: '/:tenantId/t/venues/:venueId/edit/:activeTab/:activeSubTab' }
        })
        await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
        await updateAdvancedSettings(false)
        fireEvent.click(await screen.findByRole('tab', { name: 'Networking' }))

        await showInvalidChangesModal('Advanced Settings', buttonAction.DISCARD_CHANGES)
      })
      it('should open unsaved changes modal and handle changes saved', async () => {
        render(<Provider><VenueEdit /></Provider>, {
          route: { params, path: '/:tenantId/t/venues/:venueId/edit/:activeTab/:activeSubTab' }
        })
        await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
        await updateAdvancedSettings(true)
        fireEvent.click(await screen.findByRole('tab', { name: 'Networking' }))

        await showUnsavedChangesModal('Advanced Settings', buttonAction.SAVE_CHANGES)
      })
    })
    describe('Networking', () => {
      const params = {
        tenantId: 'tenant-id',
        venueId: 'venue-id',
        activeTab: 'wifi',
        activeSubTab: 'networking'
      }
      it('should open unsaved changes modal and handle changes discarded', async () => {
        render(<Provider><VenueEdit /></Provider>, {
          route: { params, path: '/:tenantId/t/venues/:venueId/edit/:activeTab/:activeSubTab' }
        })
        await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
        await waitFor(() => screen.findByText('AP Model'))
        await updateLanPorts()
        await updateMeshNetwork()
        fireEvent.click(await screen.findByRole('tab', { name: 'Advanced' }))
        await showUnsavedChangesModal('Networking', buttonAction.CANCEL)

        fireEvent.click(await screen.findByRole('tab', { name: 'Advanced' }))
        await showUnsavedChangesModal('Networking', buttonAction.DISCARD_CHANGES)
      })
      it('should open unsaved changes modal and handle changes saved', async () => {
        render(<Provider><VenueEdit /></Provider>, {
          route: { params, path: '/:tenantId/t/venues/:venueId/edit/:activeTab/:activeSubTab' }
        })
        await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
        await waitFor(() => screen.findByText('AP Model'))
        await updateMeshNetwork()

        fireEvent.click(await screen.findByRole('tab', { name: 'Advanced' }))
        await showUnsavedChangesModal('Networking', buttonAction.SAVE_CHANGES)
      })
    })

    describe('Radio', () => {
      const params = {
        tenantId: 'tenant-id',
        venueId: 'venue-id',
        activeTab: 'wifi',
        activeSubTab: 'radio'
      }
      it.skip('should open unsaved changes modal and handle changes discarded', async () => {
        const requestSpy = jest.fn()
        mockServer.use(
          rest.get(
            WifiUrlsInfo.getVenueExternalAntenna.url,
            (_, res, ctx) => {
              requestSpy()
              return res(ctx.json(venueExternalAntenna))
            })
        )

        render(<Provider><VenueEdit /></Provider>, {
          route: { params, path: '/:tenantId/t/venues/:venueId/edit/:activeTab/:activeSubTab' }
        })
        await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
        await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))
      })
    })

    describe('Servers', () => {
      const params = {
        tenantId: 'tenant-id',
        venueId: 'venue-id',
        activeTab: 'wifi',
        activeSubTab: 'servers'
      }
      beforeEach(() => {
        store.dispatch(policyApi.util.resetApiState())
        store.dispatch(venueApi.util.resetApiState())
        mockServer.use(
          rest.get(SyslogUrls.getVenueSyslogAp.url,
            (_, res, ctx) => res(ctx.json({ enabled: false }))),
          rest.post(SyslogUrls.getVenueSyslogAp.url,
            (_, res, ctx) => res(ctx.json({})))
        )
      })
      it('should open unsaved changes modal and handle changes discarded', async () => {
        render(<Provider><VenueEdit /></Provider>, {
          route: { params, path: '/:tenantId/t/venues/:venueId/edit/:activeTab/:activeSubTab' }
        })
        await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
        await waitFor(() => screen.findByText('Enable Server'))
        await updateSyslogServer()

        fireEvent.click(await screen.findByRole('tab', { name: 'Advanced' }))
        await showUnsavedChangesModal('Network Controls', buttonAction.DISCARD_CHANGES)
      })
      it('should open unsaved changes modal and handle changes saved', async () => {
        render(<Provider><VenueEdit /></Provider>, {
          route: { params, path: '/:tenantId/t/venues/:venueId/edit/:activeTab/:activeSubTab' }
        })
        await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
        await waitFor(() => screen.findByText('Enable Server'))
        await updateSyslogServer()

        fireEvent.click(await screen.findByRole('tab', { name: 'Advanced' }))
        await showUnsavedChangesModal('Network Controls', buttonAction.SAVE_CHANGES)
      })
    })
  })
})
