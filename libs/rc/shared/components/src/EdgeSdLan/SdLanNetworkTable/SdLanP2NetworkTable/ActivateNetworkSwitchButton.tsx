import { Switch, Tooltip } from 'antd'
import _                   from 'lodash'
import { useIntl }         from 'react-intl'

import { Network }       from '@acx-ui/rc/utils'
import { EdgeScopes }    from '@acx-ui/types'
import { hasPermission } from '@acx-ui/user'

export interface ActivateNetworkSwitchButtonP2Props {
    row: Network,
    activated: string[],
    disabled?: boolean,
    fieldName: string,
    onChange?: (
      fieldName: string,
      data: Network,
      checked: boolean,
      activated: string[],
      ) => void,
    tooltip?: string
}

export const ActivateNetworkSwitchButtonP2 = (props: ActivateNetworkSwitchButtonP2Props) => {
  const { $t } = useIntl()
  const { fieldName, row, activated, disabled, onChange } = props
  const isActivated = _.findIndex(activated, i => i === row.id) !== -1
  const isPermiited = hasPermission({
    scopes: [EdgeScopes.CREATE, EdgeScopes.UPDATE]
  })
  let newSelected = _.cloneDeep(activated)

  const switchComponent = <Switch
    checked={isActivated}
    disabled={!!disabled || !isPermiited}
    onChange={(checked: boolean) => {
      if (checked) {
        newSelected = _.union(newSelected, [row.id!])
      } else {
        _.remove(newSelected, i => i === row.id)
      }

      onChange?.(fieldName, _.omit(row, 'children'), checked, newSelected)
    }}
  />

  const tooltip = props.tooltip
    || (!isPermiited ? $t({ defaultMessage: 'No permission on this' }) : undefined)

  return tooltip
    ? <Tooltip title={tooltip}>
      {switchComponent}
    </Tooltip>
    : switchComponent
}