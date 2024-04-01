import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { VenueFirmwareList }           from './VenueFirmwareList'
import { VenueFirmwareListPerApModel } from './VenueFirmwareListPerApModel'
import VersionBanner                   from './VersionBanner'
import { VersionBannerPerApModel }     from './VersionBannerPerApModel'

const ApFirmware = () => {
  const isUpgradeByModelEnabled = useIsSplitOn(Features.AP_FW_MGMT_UPGRADE_BY_MODEL)

  return (
    <>
      {isUpgradeByModelEnabled ? <VersionBannerPerApModel /> : <VersionBanner />}
      {isUpgradeByModelEnabled ? <VenueFirmwareListPerApModel /> : <VenueFirmwareList />}
    </>
  )
}

export default ApFirmware
