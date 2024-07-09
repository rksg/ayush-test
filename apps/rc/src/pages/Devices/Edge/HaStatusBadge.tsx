import { useIntl } from 'react-intl'

import { NodeClusterRoleEnum } from '@acx-ui/rc/utils'

import { Badge } from './styledComponents'

interface HaStatusBadgeProps {
  haStatus?: string
  needPostFix?: boolean
}

export const HaStatusBadge = (props: HaStatusBadgeProps) => {
  const { haStatus = '', needPostFix } = props
  const { $t } = useIntl()

  const defaultColor = '--acx-neutrals-60'
  const defaultValue = 'N/A'

  const haStatusMessageMapping = {
    [NodeClusterRoleEnum.CLUSTER_ROLE_ACTIVE]: {
      text: $t({ defaultMessage: 'Active' }),
      color: '--acx-semantics-green-40'
    },
    [NodeClusterRoleEnum.CLUSTER_ROLE_BACKUP]: {
      text: $t({ defaultMessage: 'Standby' }),
      color: '--acx-accents-blue-60'
    }
  } as { [key: string] : { text: string, color: string } }

  const statusSetting = haStatusMessageMapping[haStatus]

  return <Badge
    color={statusSetting?.color ?? defaultColor}
  >
    {
      statusSetting?.text ?
        needPostFix ? statusSetting.text + ' node' : statusSetting.text
        : defaultValue
    }
  </Badge>
}
