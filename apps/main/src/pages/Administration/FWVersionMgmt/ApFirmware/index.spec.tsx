import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { render, screen }         from '@acx-ui/test-utils'

import ApFirmware from '.'

jest.mock('./VersionBanner', () => () => <div>Version Banner</div>)
jest.mock('./VersionBannerPerApModel', () => ({
  VersionBannerPerApModel: () => <div>Version Banner Per AP Model</div>
}))
jest.mock('./VenueFirmwareList', () => ({
  ...jest.requireActual('./VenueFirmwareList'),
  VenueFirmwareList: () => <div>Venue Firmware List</div>
}))
jest.mock('./VenueFirmwareListPerApModel', () => ({
  ...jest.requireActual('./VenueFirmwareListPerApModel'),
  VenueFirmwareListPerApModel: () => <div>Venue Firmware List Per ApModel</div>
}))
jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: jest.fn()
}))

describe('AP Firmware', () => {

  afterEach(() => {
    jest.mocked(useIsSplitOn).mockRestore()
  })

  it('should render ApFirmware', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const { rerender } = render(<ApFirmware />)

    await screen.findByText('Version Banner')
    await screen.findByText('Venue Firmware List')

    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.AP_FW_MGMT_UPGRADE_BY_MODEL)
    rerender(<ApFirmware />)

    await screen.findByText('Version Banner Per AP Model')
    await screen.findByText('Venue Firmware List Per ApModel')
  })
})
