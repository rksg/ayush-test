import { useIntl } from 'react-intl'

import { EdgeStatusEnum } from '@acx-ui/rc/utils'

import { StatusLight } from '../StatusLight'


type EdgeStatusLightProps = {
  data: string
}

export const EdgeStatusLight = (props: EdgeStatusLightProps) => {

  const { $t } = useIntl()

  const EdgeStatusLightConfig = {
    [EdgeStatusEnum.NEVER_CONTACTED_CLOUD]: {
      color: 'var(--acx-neutrals-50)',
      text: $t({ defaultMessage: 'Never Contacted Cloud' })
    },
    [EdgeStatusEnum.INITIALIZING]: {
      color: 'var(--acx-neutrals-50)',
      text: $t({ defaultMessage: 'Initializing' })
    },
    [EdgeStatusEnum.NEEDS_CONFIG]: {
      color: 'var(--acx-neutrals-50)',
      text: $t({ defaultMessage: 'Needs Config' })
    },
    [EdgeStatusEnum.OPERATIONAL]: {
      color: 'var(--acx-semantics-green-50)',
      text: $t({ defaultMessage: 'Operational' })
    },
    [EdgeStatusEnum.APPLYING_CONFIGURATION]: {
      color: 'var(--acx-semantics-green-50)',
      text: $t({ defaultMessage: 'Applying Configuration' })
    },
    [EdgeStatusEnum.DISCONNECTED_FROM_CLOUD]: {
      color: 'var(--acx-semantics-red-50)',
      text: $t({ defaultMessage: 'Disconnected From Cloud' })
    }
  }

  return (
    <StatusLight config={EdgeStatusLightConfig} data={props.data} />
  )
}
