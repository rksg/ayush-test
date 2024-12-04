import { createContext } from 'react'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { getJwtTokenPayload }     from '@acx-ui/utils'

import { VenueFirmwareList }           from './VenueFirmwareList'
import { VenueFirmwareListPerApModel } from './VenueFirmwareListPerApModel'
import VersionBanner                   from './VersionBanner'
import { VersionBannerPerApModel }     from './VersionBannerPerApModel'

export const ApFirmwareContext = createContext({} as Record<string, unknown>)

// @ts-ignore
const ApFirmwareProvider = ({ children }) => {
  const jwtPayload = getJwtTokenPayload()
  return (
    <ApFirmwareContext.Provider value={jwtPayload as unknown as Record<string, unknown>}>
      {children}
    </ApFirmwareContext.Provider>
  )
}

const ApFirmware = () => {
  const isUpgradeByModelEnabled = useIsSplitOn(Features.AP_FW_MGMT_UPGRADE_BY_MODEL)

  return (
    <ApFirmwareProvider>
      {isUpgradeByModelEnabled ? <VersionBannerPerApModel /> : <VersionBanner />}
      {isUpgradeByModelEnabled ? <VenueFirmwareListPerApModel /> : <VenueFirmwareList />}
    </ApFirmwareProvider>
  )
}

export default ApFirmware
