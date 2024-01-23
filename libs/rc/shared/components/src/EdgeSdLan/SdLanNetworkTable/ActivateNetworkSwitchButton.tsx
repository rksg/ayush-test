import { Switch } from 'antd'
import _          from 'lodash'

import { NetworkSaveData } from '@acx-ui/rc/utils'

export interface ActivateNetworkSwitchButtonProps {
  row: NetworkSaveData,
  rows: NetworkSaveData[],
  activated: string[],
  disabled?: boolean,
  onChange?: (
    data: NetworkSaveData,
    checked: boolean,
    activated: NetworkSaveData[]
    ) => void
}

export const ActivateNetworkSwitchButton = (props: ActivateNetworkSwitchButtonProps) => {
  const { row, rows, activated, disabled, onChange } = props

  const isActivated = _.findIndex(activated, i => i === row.id)
  let newSelected = rows.filter(item => activated.includes(item.id!))

  return <Switch
    aria-label={`activate-btn-${row.id}`}
    checked={isActivated !== -1}
    disabled={!!disabled}
    onChange={(checked: boolean) => {
      if (checked) {
        newSelected = _.unionBy(newSelected, [row], 'id')
      } else {
        _.remove(newSelected,
          i => i.id === row.id)
      }

      onChange?.(_.omit(row, 'children'), checked, newSelected)
    }}
  />
}