
import { ClusterNetworkMultiWanSettings, ClusterNetworkSettings, EdgeLag, EdgeLinkDownCriteriaEnum, EdgeMultiWanModeEnum, EdgeMultiWanProtocolEnum, EdgePort, EdgeWanMember, getEdgeWanInterfaces } from '@acx-ui/rc/utils'
import { getIntl }                                                                                                                                                                                  from '@acx-ui/utils'

export const getDualWanModeString = (type: EdgeMultiWanModeEnum) => {
  const { $t } = getIntl()

  switch (type) {
    case EdgeMultiWanModeEnum.ACTIVE_BACKUP:
      return $t({ defaultMessage: 'Aactive / Backup' })
    case EdgeMultiWanModeEnum.NONE:
    default:
      return ''
  }
}

export const getWanProtocolString = (type: EdgeMultiWanProtocolEnum) => {
  const { $t } = getIntl()

  switch (type) {
    case EdgeMultiWanProtocolEnum.PING:
      return $t({ defaultMessage: 'Ping' })
    case EdgeMultiWanProtocolEnum.NONE:
    default:
      return ''
  }
}

// eslint-disable-next-line max-len
export const getWanLinkDownCriteriaString = (type: EdgeLinkDownCriteriaEnum) => {
  const { $t } = getIntl()

  switch (type) {
    case EdgeLinkDownCriteriaEnum.ALL_TARGETS_DOWN:
      return $t({ defaultMessage: 'All destinations were unreachable' })
    case EdgeLinkDownCriteriaEnum.ANY_TARGET_DOWN:
      return $t({ defaultMessage: 'One or more of the destinations were unreachable' })
    case EdgeLinkDownCriteriaEnum.INVALID:
    default:
      return ''
  }
}

export const getDualWanDefaultDataFromApiData = (
  apiData: ClusterNetworkSettings | undefined
): ClusterNetworkMultiWanSettings | undefined => {

  let multiWanSettings = apiData?.multiWanSettings

  // only handle single-node case
  if (apiData?.portSettings?.length === 1) {
    // eslint-disable-next-line max-len
    const wans = getEdgeWanInterfaces(apiData?.portSettings[0].ports, apiData?.lagSettings[0].lags)
    // eslint-disable-next-line max-len
    if (wans.length > 1 && apiData?.multiWanSettings?.mode !== EdgeMultiWanModeEnum.ACTIVE_BACKUP) {
      const wanMembers = wans.map((item, idx) =>
        ({
          serialNumber: apiData?.portSettings[0].serialNumber,
          portName: item.hasOwnProperty('interfaceName')
            ? ((item as EdgePort).interfaceName as string)
            : `lag${(item as EdgeLag).id}`,
          priority: idx + 1,
          healthCheckEnabled: false,
          linkHealthCheckPolicy: undefined
        })) as unknown as EdgeWanMember[]

      multiWanSettings = {
        mode: EdgeMultiWanModeEnum.ACTIVE_BACKUP,
        wanMembers
      }
    }
  }

  return multiWanSettings
}