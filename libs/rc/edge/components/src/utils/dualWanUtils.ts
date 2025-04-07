import { EdgeLinkDownCriteriaEnum, EdgeMultiWanModeEnum, EdgeMultiWanProtocolEnum } from '@acx-ui/rc/utils'
import { getIntl }                                                                  from '@acx-ui/utils'

export const getDualWanModeString = (type: EdgeMultiWanModeEnum) => {
  const { $t } = getIntl()

  switch (type) {
    case EdgeMultiWanModeEnum.ACTIVE_BACKUP:
      return $t({ defaultMessage: 'Active / Backup' })
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