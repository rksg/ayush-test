import { defineMessage } from 'react-intl'

import { ClusterHighAvailabilityModeEnum, EdgeStatusSeverityEnum } from '@acx-ui/rc/utils'
import { getIntl }                                                 from '@acx-ui/utils'

export const getHaModeDisplayString = (highAvailabilityMode?: ClusterHighAvailabilityModeEnum) => {
  switch(highAvailabilityMode) {
    case ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE:
      return defineMessage({ defaultMessage: 'Active-Active' })
    case ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY:
      return defineMessage({ defaultMessage: 'Active-Standby' })
    default:
      return defineMessage({ defaultMessage: 'N/A' })
  }
}

const edgeStatusMap = {
  [EdgeStatusSeverityEnum.REQUIRES_ATTENTION]: defineMessage({
    defaultMessage: '{showSeverity, selectordinal, one {1 } other {}}Requires Attention',
    description: 'Translation string - Requires Attention'
  }),
  [EdgeStatusSeverityEnum.TRANSIENT_ISSUE]: defineMessage({
    defaultMessage: '{showSeverity, selectordinal, one {2 } other {}}Transient Issue',
    description: 'Translation string - Transient Issue'
  }),
  [EdgeStatusSeverityEnum.IN_SETUP_PHASE]: defineMessage({
    defaultMessage: '{showSeverity, selectordinal, one {3 } other {}}In Setup Phase',
    description: 'Translation string - In Setup Phase'
  }),
  [EdgeStatusSeverityEnum.OPERATIONAL]: defineMessage({
    defaultMessage: '{showSeverity, selectordinal, one {4 } other {}}Operational',
    description: 'Translation string - Operational'
  }),
  [EdgeStatusSeverityEnum.OFFLINE]: defineMessage({
    defaultMessage: '{showSeverity, selectordinal, one {3 } other {}}Offline',
    description: 'Translation string - Offline'
  })
}

// eslint-disable-next-line max-len
export const getEdgeStatusDisplayName = (label: EdgeStatusSeverityEnum, showSeverity: boolean = true) => {
  const { $t } = getIntl()
  return $t(edgeStatusMap[label], { showSeverity })
}