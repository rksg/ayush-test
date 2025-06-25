import { createContext } from 'react'

import { useUserProfileContext } from '@acx-ui/user'

import { VenueFirmwareListPerApModel } from './VenueFirmwareListPerApModel'
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
  return (
    <ApFirmwareProvider>
      <VersionBannerPerApModel />
      <VenueFirmwareListPerApModel />
    </ApFirmwareProvider>
  )
}

export default ApFirmware
