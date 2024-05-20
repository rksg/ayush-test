import { getIntl } from '@acx-ui/utils'

import { RWGStatusEnum, RWGStatusMap } from '../../types'

export function getRwgStatus (status: RWGStatusEnum) {
  return seriesMappingRWG().filter(({ key }) => key === status)[0]
}

export const seriesMappingRWG = () => [
  { key: RWGStatusEnum.OFFLINE,
    name: getRwgStatusDisplayName(RWGStatusEnum.OFFLINE, false),
    color: '--acx-semantics-red-50' },
  { key: RWGStatusEnum.INVALID_APIKEY,
    name: getRwgStatusDisplayName(RWGStatusEnum.INVALID_APIKEY, false),
    color: '--acx-semantics-yellow-40' },
  { key: RWGStatusEnum.STAGING,
    name: getRwgStatusDisplayName(RWGStatusEnum.STAGING, false),
    color: '--acx-neutrals-50' },
  { key: RWGStatusEnum.RWG_STATUS_UNKNOWN,
    name: getRwgStatusDisplayName(RWGStatusEnum.RWG_STATUS_UNKNOWN, false),
    color: '--acx-neutrals-50' },
  { key: RWGStatusEnum.ONLINE,
    name: getRwgStatusDisplayName(RWGStatusEnum.ONLINE, false),
    color: '--acx-semantics-green-50' },
  { key: RWGStatusEnum.DATA_INCOMPLETE,
    name: getRwgStatusDisplayName(RWGStatusEnum.DATA_INCOMPLETE, false),
    color: '--acx-semantics-red-50' },
  { key: RWGStatusEnum.INSUFFICIENT_LICENSE,
    name: getRwgStatusDisplayName(RWGStatusEnum.INSUFFICIENT_LICENSE, false),
    color: '--acx-semantics-yellow-40' },
  { key: RWGStatusEnum.INVALID_CERTIFICATE,
    name: getRwgStatusDisplayName(RWGStatusEnum.INVALID_CERTIFICATE, false),
    color: '--acx-semantics-red-50' },
  { key: RWGStatusEnum.INVALID_HOSTNAME,
    name: getRwgStatusDisplayName(RWGStatusEnum.INVALID_HOSTNAME, false),
    color: '--acx-semantics-red-50' },
  { key: RWGStatusEnum.INVALID_LICENSE,
    name: getRwgStatusDisplayName(RWGStatusEnum.INVALID_LICENSE, false),
    color: '--acx-semantics-red-50' }
] as Array<{ key: string, name: string, color: string }>

export const getRwgStatusDisplayName = (label: RWGStatusEnum, showSeverity: boolean = true) => {
  const { $t } = getIntl()
  return $t(RWGStatusMap[label], { showSeverity })
}