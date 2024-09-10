import { IntlShape } from 'react-intl'

import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { FirmwareCategory, firmwareTypeTrans } from '../types/firmware'

export type VersionLabelType = {
  name: string,
  category: FirmwareCategory,
  onboardDate?: string,
  releaseDate?: string
}

// eslint-disable-next-line max-len
export const getFirmwareVersionLabel = (intl: IntlShape, version: VersionLabelType, showType = true): string => {
  const transform = firmwareTypeTrans(intl.$t)
  const versionName = version?.name
  const versionType = transform(version?.category)
  const displayDate = version.releaseDate ?? version.onboardDate
  const versionDate = displayDate
    ? formatter(DateFormatEnum.DateFormat)(displayDate)
    : ''

  // eslint-disable-next-line max-len
  return `${versionName}${showType ? ` (${versionType}) ` : ' '}${versionDate ? '- ' + versionDate : ''}`
}