/* eslint-disable react/jsx-no-comment-textnodes */
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { NewAlarmsDrawer } from './NewAlarmDrawer'
import { OldAlarmsDrawer } from './OldAlarmDrawer'

export interface AlarmsType {
  setVisible: (visible: boolean) => void,
  visible?: boolean,
  serialNumber?: string
}

export function AlarmsDrawer (props: AlarmsType) {
  const { visible, setVisible, serialNumber } = props
  const isClearAlarmToggleEnable = useIsSplitOn(Features.ALARM_CLEAR_ALARM_TOGGLE)

  return isClearAlarmToggleEnable
    ? <NewAlarmsDrawer
      visible={visible}
      setVisible={setVisible}
      serialNumber={serialNumber}
    />
    : <OldAlarmsDrawer
      visible={visible}
      setVisible={setVisible}
      serialNumber={serialNumber}
    />
}
