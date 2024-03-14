import { Switch, Tooltip } from 'antd'
import _                   from 'lodash'

import { NetworkSaveData } from '@acx-ui/rc/utils'

import { ActivateNetworkSwitchButtonProps } from '../ActivateNetworkSwitchButton'

export interface ActivateNetworkSwitchButtonP2Props
  extends Omit<ActivateNetworkSwitchButtonProps, 'rows' | 'onChange'> {
    fieldName: string,
    onChange?: (
      fieldName: string,
      data: NetworkSaveData,
      checked: boolean,
      activated: string[],
      ) => void,
    tooltip?: string
}

export const ActivateNetworkSwitchButtonP2 = (props: ActivateNetworkSwitchButtonP2Props) => {
  const { fieldName, row, activated, disabled, onChange, tooltip } = props
  const isActivated = _.findIndex(activated, i => i === row.id)
  let newSelected = _.cloneDeep(activated)

  const switchComponent = <Switch
    checked={isActivated !== -1}
    disabled={!!disabled}
    onChange={(checked: boolean) => {
      if (checked) {
        newSelected = _.union(newSelected, [row.id!])
      } else {
        _.remove(newSelected, i => i === row.id)
      }

      onChange?.(fieldName, _.omit(row, 'children'), checked, newSelected)
    }}
  />
  return tooltip
    ? <Tooltip title={tooltip}>
      {switchComponent}
    </Tooltip>
    : switchComponent
}