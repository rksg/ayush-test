/* eslint-disable max-len */
import { get }           from 'lodash'
import { defineMessage } from 'react-intl'

import { getIntl } from '@acx-ui/utils'

import { EdgeStatusSeverityEnum }              from './models/EdgeEnum'
import { ApVenueStatusEnum, SwitchStatusEnum } from './types'

const apStatusMap = {
  [ApVenueStatusEnum.REQUIRES_ATTENTION]: defineMessage({
    defaultMessage: '{showSeverity, selectordinal, one {1 } other {}}Requires Attention'
  }),
  [ApVenueStatusEnum.TRANSIENT_ISSUE]: defineMessage({
    defaultMessage: '{showSeverity, selectordinal, one {2 } other {}}Transient Issue'
  }),
  [ApVenueStatusEnum.IN_SETUP_PHASE]: defineMessage({
    defaultMessage: '{showSeverity, selectordinal, one {3 } other {}}In Setup Phase'
  }),
  [ApVenueStatusEnum.OPERATIONAL]: defineMessage({
    defaultMessage: '{showSeverity, selectordinal, one {4 } other {}}Operational'
  }),
  [ApVenueStatusEnum.OFFLINE]: defineMessage({
    defaultMessage: '{showSeverity, selectordinal, one {3 } other {}}Offline'
  }),
  [ApVenueStatusEnum.IN_SETUP_PHASE_AND_OFFLINE]: defineMessage({
    defaultMessage: '{showSeverity, selectordinal, one {3 } other {}}In Setup Phase & Offline'
  })
}

const switchStatusMap = {
  [SwitchStatusEnum.OPERATIONAL]: defineMessage({ defaultMessage: 'Operational' }),
  [SwitchStatusEnum.DISCONNECTED]: defineMessage({ defaultMessage: 'Alerting' }),
  [SwitchStatusEnum.NEVER_CONTACTED_CLOUD]: defineMessage({ defaultMessage: 'In Setup Phase' }),
  [SwitchStatusEnum.INITIALIZING]: defineMessage({ defaultMessage: 'In Setup Phase' }),
  [SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED]: defineMessage({ defaultMessage: 'In Setup Phase' }),
  [SwitchStatusEnum.APPLYING_FIRMWARE]: defineMessage({ defaultMessage: 'Requires Attention' }),
  [SwitchStatusEnum.FIRMWARE_UPD_START]: defineMessage({ defaultMessage: 'Requires Attention' }),
  [SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_PARAMETERS]: defineMessage({ defaultMessage: 'Requires Attention' }),
  [SwitchStatusEnum.FIRMWARE_UPD_DOWNLOADING]: defineMessage({ defaultMessage: 'Requires Attention' }),
  [SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_IMAGE]: defineMessage({ defaultMessage: 'Requires Attention' }),
  [SwitchStatusEnum.FIRMWARE_UPD_SYNCING_TO_REMOTE]: defineMessage({ defaultMessage: 'Requires Attention' }),
  [SwitchStatusEnum.FIRMWARE_UPD_WRITING_TO_FLASH]: defineMessage({ defaultMessage: 'Requires Attention' }),
  [SwitchStatusEnum.FIRMWARE_UPD_FAIL]: defineMessage({ defaultMessage: 'Alerting' }),
  default: defineMessage({ defaultMessage: 'In Setup Phase' })
}

const edgeStatusMap = {
  [EdgeStatusSeverityEnum.REQUIRES_ATTENTION]: defineMessage({
    defaultMessage: '{showSeverity, selectordinal, one {1 } other {}}Requires Attention'
  }),
  [EdgeStatusSeverityEnum.TRANSIENT_ISSUE]: defineMessage({
    defaultMessage: '{showSeverity, selectordinal, one {2 } other {}}Transient Issue'
  }),
  [EdgeStatusSeverityEnum.IN_SETUP_PHASE]: defineMessage({
    defaultMessage: '{showSeverity, selectordinal, one {3 } other {}}In Setup Phase'
  }),
  [EdgeStatusSeverityEnum.OPERATIONAL]: defineMessage({
    defaultMessage: '{showSeverity, selectordinal, one {4 } other {}}Operational'
  }),
  [EdgeStatusSeverityEnum.OFFLINE]: defineMessage({
    defaultMessage: '{showSeverity, selectordinal, one {3 } other {}}Offline'
  })
}

export const getAPStatusDisplayName = (label: ApVenueStatusEnum, showSeverity: boolean = true) => {
  const { $t } = getIntl()
  return $t(apStatusMap[label], { showSeverity })
}

export const getSwitchStatusDisplayName = (switchStatus: SwitchStatusEnum) => {
  const { $t } = getIntl()
  return $t(get(switchStatusMap, switchStatus, switchStatusMap.default))
}

export const getEdgeStatusDisplayName = (label: EdgeStatusSeverityEnum, showSeverity: boolean = true) => {
  const { $t } = getIntl()
  return $t(edgeStatusMap[label], { showSeverity })
}
