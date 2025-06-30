import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { firmwareApi }      from '@acx-ui/rc/services'
import { FirmwareUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }  from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import {
  preference,
  availableVersions
} from './__tests__/fixtures'
import { PreferencesDialog } from './PreferencesDialog'

const updatePreferencesRequestSpy = jest.fn()

describe('Firmware Venues Table', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    updatePreferencesRequestSpy.mockReset()
    Modal.destroyAll()
    store.dispatch(firmwareApi.util.resetApiState())
    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getAvailableFirmwareList.url.replace('?status=release', ''),
        (req, res, ctx) => res(ctx.json(availableVersions))
      ),
      rest.get(
        FirmwareUrlsInfo.getUpgradePreferences.url,
        (req, res, ctx) => res(ctx.json(preference))
      ),
      rest.put(
        FirmwareUrlsInfo.updateSwitchFirmwarePredownload.url,
        (req, res, ctx) => res(ctx.status(200))
      ),
      rest.put(
        FirmwareUrlsInfo.updateUpgradePreferences.url,
        (req, res, ctx) => {
          updatePreferencesRequestSpy()
          return res(ctx.status(200))
        }
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render preferences Pre-Download', async () => {
    const onSubmitSpy = jest.fn()
    render(
      <Provider>
        <PreferencesDialog
          visible={true}
          data={preference}
          onCancel={()=>{}}
          onSubmit={onSubmitSpy()}
          isSwitch={true}
          preDownload={true}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByTestId('PreDownload')).toBeChecked()

    await userEvent.click(within(dialog).getByTestId('PreDownload'))
    expect(within(dialog).getByTestId('PreDownload')).not.toBeChecked()

    const updateVenueButton = await within(dialog).findByText('Save Preferences')
    await userEvent.click(updateVenueButton)
    expect(onSubmitSpy).toBeCalled()
  })

})
