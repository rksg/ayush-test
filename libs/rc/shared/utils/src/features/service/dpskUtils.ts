import moment                               from 'moment'
import { MessageDescriptor, defineMessage } from 'react-intl'

import { getIntl } from '@acx-ui/utils'

import { EXPIRATION_TIME_FORMAT } from '../../pipes/networkPipes'
import { NewDpskPassphrase }      from '../../types'

enum DpskPassphraseStatusEnum {
  REVOKED,
  EXPIRED,
  ACTIVE
}

const dpskPassphraseStatusTextMapping: Record<DpskPassphraseStatusEnum, MessageDescriptor> = {
  // eslint-disable-next-line max-len
  [DpskPassphraseStatusEnum.REVOKED]: defineMessage({ defaultMessage: 'Revoked ({revocationDate})' }),
  [DpskPassphraseStatusEnum.EXPIRED]: defineMessage({ defaultMessage: 'Expired' }),
  [DpskPassphraseStatusEnum.ACTIVE]: defineMessage({ defaultMessage: 'Active' })
}

export const unlimitedNumberOfDeviceLabel = defineMessage({ defaultMessage: 'Unlimited' })

export function displayDeviceCountLimit (count: number | undefined) {
  const { $t } = getIntl()
  return count ? count : $t(unlimitedNumberOfDeviceLabel)
}

// eslint-disable-next-line max-len
export function getPassphraseStatus (passphrase: NewDpskPassphrase, isCloudpathEnabled = false): string {
  const { $t } = getIntl()

  if (isCloudpathEnabled && passphrase.revocationDate) {
    const revocationDate = moment(passphrase.revocationDate).format(EXPIRATION_TIME_FORMAT)
    return $t(dpskPassphraseStatusTextMapping[DpskPassphraseStatusEnum.REVOKED], { revocationDate })
  // eslint-disable-next-line max-len
  } else if (passphrase.expirationDate && moment(passphrase.expirationDate).isSameOrBefore(new Date())) {
    return $t(dpskPassphraseStatusTextMapping[DpskPassphraseStatusEnum.EXPIRED])
  }
  return $t(dpskPassphraseStatusTextMapping[DpskPassphraseStatusEnum.ACTIVE])
}

// eslint-disable-next-line max-len
export function isActivePassphrase (passphrase: NewDpskPassphrase, isCloudpathEnabled = false): boolean {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  return getPassphraseStatus(passphrase, isCloudpathEnabled) === $t(dpskPassphraseStatusTextMapping[DpskPassphraseStatusEnum.ACTIVE])
}
