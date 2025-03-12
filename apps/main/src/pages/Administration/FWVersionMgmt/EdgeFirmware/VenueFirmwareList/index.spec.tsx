import userEvent             from '@testing-library/user-event'
import { Modal, ModalProps } from 'antd'
import { rest }              from 'msw'

import { Features, useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { EdgeChangeScheduleDialogProps }               from '@acx-ui/rc/components'
import { firmwareApi }                                 from '@acx-ui/rc/services'
import { FirmwareUrlsInfo, SwitchFirmwareFixtures }    from '@acx-ui/rc/utils'
import { Provider, store }                             from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { availableVersions, preferenceData, venueFirmwareList } from '../__tests__/fixtures'

import { VenueFirmwareList } from '.'

const MockModal = (props: ModalProps) => <Modal {...props} />
const { mockSwitchCurrentVersions } = SwitchFirmwareFixtures

jest.mock('@acx-ui/rc/components', () => {
  const oriComponents = jest.requireActual('@acx-ui/rc/components')
  const EdgeChangeScheduleDialog = (props: EdgeChangeScheduleDialogProps) => <MockModal
    okText='Save'
    onOk={() => {
      props.onSubmit({})
      props.onCancel()
    }}
    onCancel={props.onCancel}
    visible={props.visible}
  />
  return { ...oriComponents, EdgeChangeScheduleDialog }
})

const mockedUpdateNow = jest.fn()
const mockedUpdatePreference = jest.fn()
const mockedUpdateSchedule = jest.fn()
const mockedSkipUpdate = jest.fn()
const mockedUpdateNowBatchOperation = jest.fn()
const mockedUpdateScheduleBatchOperation = jest.fn()
const mockedSkipUpdateBatchOperation = jest.fn()
// eslint-disable-next-line max-len
jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.EDGE_FIRMWARE_NOTIFICATION_BATCH_OPERATION_TOGGLE)

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetSwitcDefaultVersionsQuery: () => ({
    data: mockSwitchCurrentVersions
  })
}))


describe('Edge venue firmware list', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    store.dispatch(firmwareApi.util.resetApiState())
    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getVenueEdgeFirmwareList.url,
        (req, res, ctx) => res(ctx.json(venueFirmwareList))
      ),
      rest.get(
        FirmwareUrlsInfo.getAvailableEdgeFirmwareVersions.url,
        (req, res, ctx) => res(ctx.json(availableVersions))
      ),
      rest.patch(
        FirmwareUrlsInfo.updateEdgeFirmware.url,
        (req, res, ctx) => {
          mockedUpdateNow()
          return res(ctx.status(202))
        }
      ),
      rest.get(
        FirmwareUrlsInfo.getEdgeUpgradePreferences.url,
        (req, res, ctx) => res(ctx.json(preferenceData))
      ),
      rest.put(
        FirmwareUrlsInfo.updateEdgeUpgradePreferences.url,
        (req, res, ctx) => {
          mockedUpdatePreference()
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        FirmwareUrlsInfo.skipEdgeUpgradeSchedules.url,
        (req, res, ctx) => {
          mockedSkipUpdate()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        FirmwareUrlsInfo.updateEdgeVenueSchedules.url,
        (req, res, ctx) => {
          mockedUpdateSchedule()
          return res(ctx.status(202))
        }
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should successfully render table', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/edgeFirmware' }
      })

    const row = await screen.findAllByRole('row', { name: /My-Venue/i })
    expect(row.length).toBe(3)
  })

  it('should update the firmware of selected venues', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/edgeFirmware' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue1/i })
    await userEvent.click(within(row).getByRole('checkbox'))

    const updateButton = await screen.findByRole('button', { name: /Update Now/i })
    await userEvent.click(updateButton)

    const updateDialog = await screen.findByRole('dialog')
    const updateVenueButton = await within(updateDialog).findByText('Run Update')
    await userEvent.click(updateVenueButton)
    await waitFor(() => expect(updateDialog).not.toBeVisible())
    await waitFor(() => expect(mockedUpdateNow).toBeCalledTimes(1))
  })

  it('should not show any update', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/edgeFirmware' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue3/i })
    await user.click(within(row).getByRole('checkbox'))

    expect(screen.queryByRole('button', { name: /Update Now/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /Change Update Schedule/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /Skip Update/i })).toBeNull()
  })

  it('should cancel update now', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/edgeFirmware' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue1/i })
    await user.click(within(row).getByRole('checkbox'))

    const updateButton = screen.getByRole('button', { name: /Update Now/i })
    await user.click(updateButton)

    await screen.findByText('Active Device')
    const updateDialog = await screen.findByRole('dialog')
    const cancelButton = within(updateDialog).getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)
    await waitFor(() => expect(updateDialog).not.toBeVisible())
  })

  it('should update the schedule update time of selected venues', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/edgeFirmware' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue1/i })
    await user.click(within(row).getByRole('checkbox'))

    const updateButton = screen.getByRole('button', { name: /Change Update Schedule/i })
    await user.click(updateButton)

    const updateDialog = await screen.findByRole('dialog')
    await user.click(within(updateDialog).getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(mockedUpdateSchedule).toBeCalledTimes(1))
    await waitFor(() => expect(updateDialog).not.toBeVisible())
  })


  it('should cancel schedule update', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/edgeFirmware' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue1/i })
    await user.click(within(row).getByRole('checkbox'))

    const updateButton = await screen.findByRole('button', { name: /Change Update Schedule/i })
    await user.click(updateButton)

    const updateDialog = await screen.findByRole('dialog')
    const cancelButton = within(updateDialog).getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)
    await waitFor(() => expect(updateDialog).not.toBeVisible())
  })

  it('should skip update for selected venues', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/edgeFirmware' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue1/i })
    await user.click(within(row).getByRole('checkbox'))

    const skipButton = await screen.findByRole('button', { name: /Skip Update/i })
    await user.click(skipButton)

    const skipDialog = await screen.findByRole('dialog')
    await user.click(within(skipDialog).getByRole('button', { name: 'Skip' }))
    await waitFor(() => expect(mockedSkipUpdate).toBeCalledTimes(1))
    await waitFor(() => expect(skipDialog).not.toBeVisible())
  })

  it('should cancel skip update', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/edgeFirmware' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue1/i })
    await user.click(within(row).getByRole('checkbox'))

    const skipButton = screen.getByRole('button', { name: /Skip Update/i })
    await user.click(skipButton)

    const skipDialog = await screen.findByRole('dialog')
    const cancelButton = within(skipDialog).getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)
    await waitFor(() => expect(skipDialog).not.toBeVisible())
  })

  it.skip('should update preference', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/edgeFirmware' }
      })

    await user.click(await screen.findByRole('button', { name: /preferences/i }))

    const preferenceDialog = await screen.findByRole('dialog')

    await user.click(within(preferenceDialog).getByRole('radio', {
      name: /schedule manually manually update firmware per venue/i
    }))
    await user.click(
      within(preferenceDialog).getByRole('button', { name: 'Save Preferences' })
    )
    await waitFor(() => expect(mockedUpdatePreference).toBeCalledTimes(1))
    await waitFor(() => expect(preferenceDialog).not.toBeVisible())
  })

  it.skip('should cancel preference update', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/edgeFirmware' }
      })

    await user.click(await screen.findByRole('button', { name: /Preferences/i }))

    const preferenceDialog = await screen.findByRole('dialog')
    const cancelButton = within(preferenceDialog).getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)
    await waitFor(() => expect(preferenceDialog).not.toBeVisible())
  })
})

describe('Edge venue firmware list with batch operation', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    store.dispatch(firmwareApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getVenueEdgeFirmwareList.url,
        (req, res, ctx) => res(ctx.json(venueFirmwareList))
      ),
      rest.get(
        FirmwareUrlsInfo.getAvailableEdgeFirmwareVersions.url,
        (req, res, ctx) => res(ctx.json(availableVersions))
      ),
      rest.post(
        FirmwareUrlsInfo.startEdgeFirmwareBatchOperation.url,
        (req, res, ctx) => res(ctx.json({
          requestId: 'requseId', response: { batchId: 'batchId' }
        }))
      ),
      rest.patch(
        FirmwareUrlsInfo.startEdgeFirmwareVenueUpdateNow.url,
        (req, res, ctx) => {
          mockedUpdateNowBatchOperation()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        FirmwareUrlsInfo.updateEdgeFirmwareVenueSchedule.url,
        (req, res, ctx) => {
          mockedUpdateScheduleBatchOperation()
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        FirmwareUrlsInfo.skipEdgeFirmwareVenueSchedule.url,
        (req, res, ctx) => {
          mockedSkipUpdateBatchOperation()
          return res(ctx.status(202))
        }
      ),
      rest.get(
        FirmwareUrlsInfo.getEdgeUpgradePreferences.url,
        (req, res, ctx) => res(ctx.json(preferenceData))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should update the firmware of selected venues', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/edgeFirmware' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue1/i })
    await userEvent.click(within(row).getByRole('checkbox'))

    const updateButton = await screen.findByRole('button', { name: /Update Now/i })
    await userEvent.click(updateButton)

    const updateDialog = await screen.findByRole('dialog')
    const updateVenueButton = await within(updateDialog).findByText('Run Update')
    await userEvent.click(updateVenueButton)
    await waitFor(() => expect(updateDialog).not.toBeVisible())
    await waitFor(() => expect(mockedUpdateNowBatchOperation).toBeCalledTimes(1))
  })

  it('should update the schedule update time of selected venues', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/edgeFirmware' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue1/i })
    await user.click(within(row).getByRole('checkbox'))

    const updateButton = screen.getByRole('button', { name: /Change Update Schedule/i })
    await user.click(updateButton)

    const updateDialog = await screen.findByRole('dialog')
    await user.click(within(updateDialog).getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(mockedUpdateScheduleBatchOperation).toBeCalledTimes(1))
    await waitFor(() => expect(updateDialog).not.toBeVisible())
  })

  it('should skip update for selected venues', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/edgeFirmware' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue1/i })
    await user.click(within(row).getByRole('checkbox'))

    const skipButton = await screen.findByRole('button', { name: /Skip Update/i })
    await user.click(skipButton)

    const skipDialog = await screen.findByRole('dialog')
    await user.click(within(skipDialog).getByRole('button', { name: 'Skip' }))
    await waitFor(() => expect(mockedSkipUpdateBatchOperation).toBeCalledTimes(1))
    await waitFor(() => expect(skipDialog).not.toBeVisible())
  })
})
