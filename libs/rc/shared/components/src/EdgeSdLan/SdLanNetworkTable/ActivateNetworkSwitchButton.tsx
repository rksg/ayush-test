import { Switch } from 'antd'
import _          from 'lodash'

import { NetworkSaveData } from '@acx-ui/rc/utils'

interface ActivateNetworkSwitchButtonProps {
  row: NetworkSaveData,
  activated: string[],
  onChange?: (
    data: NetworkSaveData,
    checked: boolean,
    activated: string[]
    ) => void
}

export const ActivateNetworkSwitchButton = (props: ActivateNetworkSwitchButtonProps) => {
  const { row, activated, onChange } = props
  const isActivated = _.findIndex(activated, i => i === row.id)

  return <Switch
    aria-label={`activate-btn-${row.id}`}
    checked={isActivated !== -1}
    onChange={(checked: boolean) => {
      let newSelected

      if (checked) {
        newSelected = _.union(activated, [row.id!])
      } else {
        newSelected = [...activated!]
        _.remove(newSelected, i => i === row.id)
      }

      onChange?.(_.omit(row, 'children'), checked, newSelected)
    }}
  />
}