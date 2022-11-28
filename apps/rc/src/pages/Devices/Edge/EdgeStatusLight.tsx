import { useIntl } from 'react-intl'

import { StatusLight }    from '@acx-ui/rc/components'
import { EdgeStatusEnum } from '@acx-ui/rc/utils'


type EdgeStatusLightProps = {
  data: string
}

export const EdgeStatusLight = (props: EdgeStatusLightProps) => {

  const { $t } = useIntl()

  const EdgeStatusLightConfig = {
    [EdgeStatusEnum.REQUIRES_ATTENTION]: {
      color: '--acx-semantics-red-50',
      text: $t({ defaultMessage: 'Requires Attention' })
    },
    [EdgeStatusEnum.TEMPORARILY_DEGRADED]: {
      color: '--acx-semantics-yellow-50',
      text: $t({ defaultMessage: 'Temporarily degraded' })
    },
    [EdgeStatusEnum.IN_SETUP_PHASE]: {
      color: '--acx-neutrals-50',
      text: $t({ defaultMessage: 'In Setup Phase' })
    },
    [EdgeStatusEnum.OFFLINE]: {
      color: '--acx-neutrals-50',
      text: $t({ defaultMessage: 'Offline' })
    },
    [EdgeStatusEnum.NEVER_CONTACTED_CLOUD]: {
      color: '--acx-neutrals-50',
      text: $t({ defaultMessage: 'Never Contacted Cloud' })
    },
    [EdgeStatusEnum.OPERATIONAL]: {
      color: '--acx-semantics-green-50',
      text: $t({ defaultMessage: 'Operational' })
    }
  }

  return (
    <StatusLight config={EdgeStatusLightConfig} data={props.data} />
  )
}
