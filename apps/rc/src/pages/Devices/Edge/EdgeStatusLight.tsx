import { useIntl } from 'react-intl'

import { StatusLight }    from '@acx-ui/rc/components'
import { EdgeStatusEnum } from '@acx-ui/rc/utils'


type EdgeStatusLightProps = {
  data: string
}

export const EdgeStatusLight = (props: EdgeStatusLightProps) => {

  const { $t } = useIntl()

  const EdgeStatusLightConfig = {
    [EdgeStatusEnum.NEVER_CONTACTED_CLOUD]: {
      color: '--acx-neutrals-50',
      text: $t({ defaultMessage: 'Never Contacted Cloud' })
    },
    [EdgeStatusEnum.INITIALIZING]: {
      color: '--acx-neutrals-50',
      text: $t({ defaultMessage: 'Initializing' })
    },
    [EdgeStatusEnum.NEEDS_CONFIG]: {
      color: '--acx-neutrals-50',
      text: $t({ defaultMessage: 'Needs Config' })
    },
    [EdgeStatusEnum.OPERATIONAL]: {
      color: '--acx-semantics-green-50',
      text: $t({ defaultMessage: 'Operational' })
    },
    [EdgeStatusEnum.APPLYING_CONFIGURATION]: {
      color: '--acx-semantics-green-50',
      text: $t({ defaultMessage: 'Applying Configuration' })
    },
    [EdgeStatusEnum.DISCONNECTED_FROM_CLOUD]: {
      color: '--acx-semantics-red-50',
      text: $t({ defaultMessage: 'Disconnected From Cloud' })
    }
  }

  return (
    <StatusLight config={EdgeStatusLightConfig} data={props.data} />
  )
}
