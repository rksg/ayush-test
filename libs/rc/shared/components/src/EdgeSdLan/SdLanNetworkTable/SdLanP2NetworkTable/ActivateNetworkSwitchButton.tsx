import { Switch } from 'antd'
import _          from 'lodash'

import { NetworkSaveData } from '@acx-ui/rc/utils'

import { ActivateNetworkSwitchButtonProps } from '../ActivateNetworkSwitchButton'

export interface ActivateNetworkSwitchButtonP2Props
  extends Omit<ActivateNetworkSwitchButtonProps, 'onChange'> {
    fieldName: string,
    onChange?: (
      fieldName: string,
      data: NetworkSaveData,
      checked: boolean,
      activated: NetworkSaveData[]
      ) => void
}

export const ActivateNetworkSwitchButtonP2 = (props: ActivateNetworkSwitchButtonP2Props) => {
  const { fieldName, row, rows, activated, disabled, onChange } = props

  const isActivated = _.findIndex(activated, i => i === row.id)
  let newSelected = rows.filter(item => activated.includes(item.id!))

  return <Switch
    checked={isActivated !== -1}
    disabled={!!disabled}
    onChange={(checked: boolean) => {
      if (checked) {
        newSelected = _.unionBy(newSelected, [row], 'id')
      } else {
        _.remove(newSelected,
          i => i.id === row.id)
      }

      onChange?.(fieldName, _.omit(row, 'children'), checked, newSelected)
    }}
  />
}