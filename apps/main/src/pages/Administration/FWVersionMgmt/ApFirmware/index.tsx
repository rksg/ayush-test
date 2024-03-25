import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { VenueFirmwareList }           from './VenueFirmwareList'
import { VenueFirmwareListPerApModel } from './VenueFirmwareListPerApModel'
import VersionBanner                   from './VersionBanner'

const ApFirmware = () => {
  const isUpgradeByModelEnabled = useIsSplitOn(Features.AP_FW_MGMT_UPGRADE_BY_MODEL)

  return (
    <>
      <VersionBanner />
      {isUpgradeByModelEnabled ? <VenueFirmwareListPerApModel /> : <VenueFirmwareList />}
    </>
  )
}

export default ApFirmware
