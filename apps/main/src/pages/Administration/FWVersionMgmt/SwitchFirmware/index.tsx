import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { VenueFirmwareList }       from './VenueFirmwareList'
import { VenueFirmwareListLegacy } from './VenueFirmwareListLegacy'
import VersionBanner               from './VersionBanner'

const SwitchFirmware = () => {
  const allowUpgradeBySwitch = useIsSplitOn(Features.SWITCH_UPGRADE_BY_SWITCH)
  return (
    <>
      <VersionBanner />
      {allowUpgradeBySwitch ?
        <VenueFirmwareList /> :
        <VenueFirmwareListLegacy />}
    </>
  )
}

export default SwitchFirmware
