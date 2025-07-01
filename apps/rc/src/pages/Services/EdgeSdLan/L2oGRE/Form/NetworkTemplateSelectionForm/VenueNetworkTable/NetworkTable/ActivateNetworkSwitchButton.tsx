import { Switch, Tooltip }                           from 'antd'
import { cloneDeep, findIndex, omit, remove, union } from 'lodash'
import { useIntl }                                   from 'react-intl'

import { EdgeSdLanUrls, Network, ServiceOperation, ServiceType, hasServicePermission } from '@acx-ui/rc/utils'
import { EdgeScopes }                                                                  from '@acx-ui/types'
import { hasPermission }                                                               from '@acx-ui/user'
import { getOpsApi }                                                                   from '@acx-ui/utils'

export interface ActivateNetworkSwitchButtonProps {
    row: Network,
    activated: string[],
    disabled?: boolean,
    onChange?: (
      data: Network,
      checked: boolean,
      activated: string[],
      ) => void,
    tooltip?: string
}

export const ActivateNetworkSwitchButton = (props: ActivateNetworkSwitchButtonProps) => {
  const { $t } = useIntl()
  const { row, activated, disabled, onChange } = props
  const isActivated = findIndex(activated, i => i === row.id) !== -1
  // eslint-disable-next-line max-len
  const hasServiceOpsPermission = hasServicePermission({ type: ServiceType.EDGE_SD_LAN, oper: ServiceOperation.EDIT })
   || hasServicePermission({ type: ServiceType.EDGE_SD_LAN, oper: ServiceOperation.CREATE })
  const isPermitted = hasServiceOpsPermission && hasPermission({
    scopes: [EdgeScopes.CREATE, EdgeScopes.UPDATE],
    rbacOpsIds: [[getOpsApi(EdgeSdLanUrls.activateEdgeMvSdLanNetwork),
      getOpsApi(EdgeSdLanUrls.deactivateEdgeMvSdLanNetwork)]]
  })
  let newSelected = cloneDeep(activated)

  const switchComponent = <Switch
    checked={isActivated}
    disabled={!!disabled || !isPermitted}
    onChange={(checked: boolean) => {
      if (checked) {
        newSelected = union(newSelected, [row.id!])
      } else {
        remove(newSelected, i => i === row.id)
      }

      onChange?.(omit(row, 'children'), checked, newSelected)
    }}
  />

  const tooltip = props.tooltip
    || (!isPermitted ? $t({ defaultMessage: 'No permission on this' }) : undefined)

  return tooltip
    ? <Tooltip title={tooltip}>
      {switchComponent}
    </Tooltip>
    : switchComponent
}