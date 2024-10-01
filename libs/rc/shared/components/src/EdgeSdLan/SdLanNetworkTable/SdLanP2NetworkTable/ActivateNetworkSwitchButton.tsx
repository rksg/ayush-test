import { Switch, Tooltip }                           from 'antd'
import { cloneDeep, findIndex, omit, remove, union } from 'lodash'
import { useIntl }                                   from 'react-intl'

import { Network, ServiceOperation, ServiceType, hasServicePermission } from '@acx-ui/rc/utils'
import { EdgeScopes }                                                   from '@acx-ui/types'
import { hasPermission }                                                from '@acx-ui/user'

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
  const isActivated = findIndex(activated, i => i === row.id) !== -1
  // eslint-disable-next-line max-len
  const hasServiceOpsPermission = hasServicePermission({ type: ServiceType.EDGE_SD_LAN, oper: ServiceOperation.EDIT })
   || hasServicePermission({ type: ServiceType.EDGE_SD_LAN, oper: ServiceOperation.CREATE })
  const isPermiited = hasServiceOpsPermission && hasPermission({
    scopes: [EdgeScopes.CREATE, EdgeScopes.UPDATE]
  })
  let newSelected = cloneDeep(activated)

  const switchComponent = <Switch
    checked={isActivated}
    disabled={!!disabled || !isPermiited}
    onChange={(checked: boolean) => {
      if (checked) {
        newSelected = union(newSelected, [row.id!])
      } else {
        remove(newSelected, i => i === row.id)
      }

      onChange?.(fieldName, omit(row, 'children'), checked, newSelected)
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