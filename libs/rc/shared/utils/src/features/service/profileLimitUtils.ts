import { getIntl } from '@acx-ui/utils'

import { profileLimitReachedMessage, ServiceType } from '../..'

const serviceProfileMaximumNumberMap: Partial<Record<ServiceType, number>> = {
  [ServiceType.WIFI_CALLING]: 5
}

export function getServiceProfileMaximumNumber (serviceType: ServiceType): number {
  const maximumNumber = serviceProfileMaximumNumberMap[serviceType]
  return maximumNumber ? maximumNumber : 32
}

export function getServiceProfileLimitReachedMessage (serviceType: ServiceType) {
  const { $t } = getIntl()
  return $t(profileLimitReachedMessage, { maxCount: getServiceProfileMaximumNumber(serviceType) })
}
