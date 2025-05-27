import { getIntl } from '@acx-ui/utils'

import { IotControllerStatusEnum, IotControllerStatusMap } from '../../types'

export function getIotControllerStatus (status: IotControllerStatusEnum) {
  return seriesMappingIotController().filter(({ key }) => key === status)[0]
}

export const seriesMappingIotController = () => [
  { key: IotControllerStatusEnum.OFFLINE,
    name: getIotControllerStatusDisplayName(IotControllerStatusEnum.OFFLINE, false),
    color: '--acx-semantics-red-50' },
  { key: IotControllerStatusEnum.ONLINE,
    name: getIotControllerStatusDisplayName(IotControllerStatusEnum.ONLINE, false),
    color: '--acx-semantics-green-50' }
] as Array<{ key: string, name: string, color: string }>

// eslint-disable-next-line max-len
export const getIotControllerStatusDisplayName = (label: IotControllerStatusEnum, showSeverity: boolean = true) => {
  const { $t } = getIntl()
  return $t(IotControllerStatusMap[label], { showSeverity })
}
