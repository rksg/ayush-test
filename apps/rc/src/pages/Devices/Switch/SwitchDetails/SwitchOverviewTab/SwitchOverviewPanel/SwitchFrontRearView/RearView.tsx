import { SwitchModelInfo, SwitchRearViewUI, UnitStatus } from '@acx-ui/rc/utils';
import _ from 'lodash';
import { useIntl } from 'react-intl';
import * as UI             from './styledComponents'

export function RearView (props:{
  slot: SwitchRearViewUI
  switchModelInfo: SwitchModelInfo
}) {
  const { slot, switchModelInfo } = props

  return <>
  { (slot.powerStatus && switchModelInfo.powerSlots && slot.powerStatus.slotNumber <= switchModelInfo.powerSlots) ?
    <RearElement icon='P' 
      status={slot.powerStatus.status}
      slotNumber={slot.powerStatus.slotNumber}
    /> : null
  }
  { (slot.fanStatus && switchModelInfo.fanSlots && slot.fanStatus.slotNumber <= switchModelInfo.fanSlots) ?
    <RearElement icon='F'
      status={slot.fanStatus.status}
      slotNumber={slot.fanStatus.slotNumber}
    /> : null
  }
  </>
}

function RearElement (props:{
  icon: 'P' | 'F',
  status: string,
  slotNumber: number
}) {
  const { $t } = useIntl()
  const { icon, status, slotNumber } = props

  const getModuleStatus = (status: string) => {
    const notPresentStatus = $t({ defaultMessage: 'not present' })
    const statusMap: {[key: string]: string} = {
      [UnitStatus.OK]: $t({ defaultMessage: 'OK' }),
      [UnitStatus.FAILED]: $t({ defaultMessage: 'Failed' }),
      [UnitStatus.NOT_PRESENT]: notPresentStatus,
      [UnitStatus.OTHER]: notPresentStatus
    }
    const moduleStatus = status.toUpperCase() as UnitStatus
    return statusMap[moduleStatus] || notPresentStatus
  }

  const getModlueStatusColor = (status: string) => {
    const defaultColor = 'gray'
    const statusMap: {[key: string]: string} = {
      [UnitStatus.OK]: 'green',
      [UnitStatus.FAILED]: 'red',
      [UnitStatus.NOT_PRESENT]: defaultColor,
      [UnitStatus.OTHER]: defaultColor
    }
    const moduleStatus = status.toUpperCase() as UnitStatus
    return statusMap[moduleStatus] || defaultColor
  }

  const getModuleLabelTextColor = (status: string) => {
    if (!status || status === UnitStatus.NOT_PRESENT || status === UnitStatus.OTHER) {
      return 'gray';
    }
    return 'black';
  }

  return <UI.RearViewWrapper>
    <UI.Rear rearColor={getModlueStatusColor(status)}>
      { icon === 'P' && <UI.RearPowerIcon />}
      { icon === 'F' && <UI.RearFanIcon />}
      <UI.RearDescrption labelColor={getModuleLabelTextColor(status)}>
        <div className='slot'>{$t({ defaultMessage: 'Slot {slotNumber}' }, {slotNumber})}</div>
        <div className='status'>{getModuleStatus(status)}</div>
      </UI.RearDescrption>
    </UI.Rear>
  </UI.RearViewWrapper>
} 