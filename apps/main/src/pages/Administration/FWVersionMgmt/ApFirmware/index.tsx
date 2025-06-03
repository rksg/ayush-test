import { createContext } from 'react'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { useUserProfileContext }  from '@acx-ui/user'

import { VenueFirmwareList }           from './VenueFirmwareList'
import { VenueFirmwareListPerApModel } from './VenueFirmwareListPerApModel'
import VersionBanner                   from './VersionBanner'
import { VersionBannerPerApModel }     from './VersionBannerPerApModel'

export const ApFirmwareContext = createContext({} as { isAlphaFlag: boolean, isBetaFlag: boolean })

// @ts-ignore
const ApFirmwareProvider = ({ children }) => {
  const { isAlphaUser, betaEnabled } = useUserProfileContext()
  return (
    <ApFirmwareContext.Provider value={{
      isAlphaFlag: isAlphaUser || false,
      isBetaFlag: !!betaEnabled
    }}>
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
