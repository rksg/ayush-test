
import { MspEcTierEnum }                       from '@acx-ui/msp/utils'
import { AccountVertical, getJwtTokenPayload } from '@acx-ui/utils'


export const getServiceTierOptions = function (
  value: MspEcTierEnum,
  ff: {
    mspServiceTierFFtoggle: boolean,
    multiLicenseFFToggle: boolean
  }) {
  const { mspServiceTierFFtoggle, multiLicenseFFToggle } = ff
  const { acx_account_vertical } = getJwtTokenPayload()
  const isHospitality = acx_account_vertical === AccountVertical.HOSPITALITY
  const isMDU = acx_account_vertical === AccountVertical.MDU
  if(multiLicenseFFToggle) {
    // isMDU : Core, Professional
    // isHospitality: Core, Professional
    // everything else: Essentials, Professional
    return (mspServiceTierFFtoggle && (isMDU || isHospitality) && value === MspEcTierEnum.Core) ||
    ((isMDU || isHospitality) && value === MspEcTierEnum.Professional) ||
    ((!(mspServiceTierFFtoggle && isMDU) && value !== MspEcTierEnum.Core) &&
    (!(mspServiceTierFFtoggle && isMDU) && !isHospitality &&
    (value === MspEcTierEnum.Essentials || value === MspEcTierEnum.Professional)))

  } else {
    // isMDU : show only Core
    // isHospitality: show only Professional
    // everything else: show both Professional and Essentials
    return (mspServiceTierFFtoggle && isMDU && value === MspEcTierEnum.Core) ||
      (isHospitality && value === MspEcTierEnum.Professional) ||
      ((!(mspServiceTierFFtoggle && isMDU) && value !== MspEcTierEnum.Core) &&
      (!(mspServiceTierFFtoggle && isMDU) && !isHospitality &&
      (value === MspEcTierEnum.Essentials || value === MspEcTierEnum.Professional)))
  }
}

