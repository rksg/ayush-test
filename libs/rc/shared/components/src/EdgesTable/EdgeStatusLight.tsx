import { useIntl } from 'react-intl'

import { EdgeStatusEnum } from '@acx-ui/rc/utils'

import { StatusLight } from '../StatusLight'


type EdgeStatusLightProps = {
  data: string,
  showText: boolean
}

export const EdgeStatusLight = (props: EdgeStatusLightProps) => {

  const { $t } = useIntl()

  const EdgeStatusLightConfig = {
    [EdgeStatusEnum.NEVER_CONTACTED_CLOUD]: {
      color: 'var(--acx-neutrals-50)',
      text: $t({ defaultMessage: 'Never contacted cloud' })
    },
    [EdgeStatusEnum.INITIALIZING]: {
      color: 'var(--acx-neutrals-50)',
      text: $t({ defaultMessage: 'Initializing' })
    },
    [EdgeStatusEnum.OFFLINE]: {
      color: 'var(--acx-neutrals-50)',
      text: $t({ defaultMessage: 'Offline' })
    },
    [EdgeStatusEnum.NEEDS_CONFIG]: {
      color: 'var(--acx-neutrals-50)',
      text: $t({ defaultMessage: 'Needs port config' })
    },
    [EdgeStatusEnum.OPERATIONAL]: {
      color: 'var(--acx-semantics-green-50)',
      text: $t({ defaultMessage: 'Operational' })
    },
    [EdgeStatusEnum.APPLYING_FIRMWARE]: {
      color: 'var(--acx-semantics-green-50)',
      text: $t({ defaultMessage: 'Applying firmware' })
    },
    [EdgeStatusEnum.APPLYING_CONFIGURATION]: {
      color: 'var(--acx-semantics-green-50)',
      text: $t({ defaultMessage: 'Applying configuration' })
    },
    [EdgeStatusEnum.FIRMWARE_UPDATE_FAILED]: {
      color: 'var(--acx-semantics-red-50)',
      text: $t({ defaultMessage: 'Firmware update failed' })
    },
    [EdgeStatusEnum.CONFIGURATION_UPDATE_FAILED]: {
      color: 'var(--acx-semantics-red-50)',
      text: $t({ defaultMessage: 'Configuration update failed' })
    },
    [EdgeStatusEnum.DISCONNECTED_FROM_CLOUD]: {
      color: 'var(--acx-semantics-red-50)',
      text: $t({ defaultMessage: 'Disconnected from cloud' })
    },
    [EdgeStatusEnum.REBOOTING]: {
      color: 'var(--acx-semantics-yellow-50)',
      text: $t({ defaultMessage: 'Rebooting' })
    },
    [EdgeStatusEnum.RESETTING]: {
      color: 'var(--acx-semantics-yellow-50)',
      text: $t({ defaultMessage: 'Resetting and recovering' })
    },
    [EdgeStatusEnum.HEARTBEAT_LOST]: {
      color: 'var(--acx-semantics-yellow-50)',
      text: $t({ defaultMessage: 'Heartbeat lost' })
    }
  }

  return (
    <StatusLight config={EdgeStatusLightConfig} data={props.data} showText={props.showText} />
  )
}
