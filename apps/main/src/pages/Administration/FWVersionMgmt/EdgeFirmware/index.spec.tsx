
import {
  Provider
} from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import EdgeFirmware from '.'

jest.mock('./VenueFirmwareList', () => ({
  VenueFirmwareList: () => <div data-testid='VenueFirmwareList' />
}))
jest.mock('./VersionBanner', () => ({
  VersionBanner: () => <div data-testid='VersionBanner' />
}))

describe('Firmware Venues Table', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render successful', async () => {
    render(
      <Provider>
        <EdgeFirmware />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/edgeFirmware' }
      })

    expect(screen.getByTestId('VenueFirmwareList')).toBeVisible()
    expect(screen.getByTestId('VersionBanner')).toBeVisible()
  })
})
