import {
  MspEcProfile,
  MspProfile
} from './types'

export * from './types'
export * from './urls'

export const MSP_USER_SETTING = 'COMMON$MSP'

export const MSPUtils = () => {

  const isMspEc = (mspEc: MspEcProfile | undefined): boolean => {
    if (mspEc?.msp_label) {
      return true
    }

    return false
  }

  const isOnboardedMsp = (msp: MspProfile | undefined): boolean => {
    if (msp?.msp_label !== '') {
      return true
    }

    return false
  }

  return {
    isMspEc,
    isOnboardedMsp
  }
}
