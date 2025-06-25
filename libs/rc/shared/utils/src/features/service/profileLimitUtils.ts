import { defineMessage } from 'react-intl'

import { getIntl } from '@acx-ui/utils'

import { ServiceType } from '../..'

const serviceProfileMaximumNumberMap: Partial<Record<ServiceType, number>> = {
  [ServiceType.WIFI_CALLING]: 5
}

export function getServiceProfileMaximumNumber (serviceType: ServiceType): number {
  const maximumNumber = serviceProfileMaximumNumberMap[serviceType]
  return maximumNumber ? maximumNumber : 32
}


// eslint-disable-next-line max-len
export const profileLimitReachedMessage = defineMessage({ defaultMessage: 'You\'ve reached the maximum of {maxCount} profiles allowed.' })

export function getServiceProfileLimitReachedMessage (serviceType: ServiceType) {
  const { $t } = getIntl()
  return $t(profileLimitReachedMessage, { maxCount: getServiceProfileMaximumNumber(serviceType) })
}
