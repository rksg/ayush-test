import { Button, Card } from '@acx-ui/components'
import { getPoeUsage, getSwitchModel, isEmpty, isOperationalSwitch, StackMember, SwitchStatusEnum, SwitchViewModel, transformSwitchStatus } from '@acx-ui/rc/utils'
import Tooltip from 'antd/es/tooltip'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import * as UI             from './styledComponents'

interface SlotMember {
  isStack: boolean
  data: StackMember[]
}

const defaultUnit = {
  switchUnit: 1,
  model: '',
  serialNumber: '',
  stackId: '',
  poeUsage: {
    used: '--',
    total: '--',
    percentage: '--'
  },
  unitStatus: {
    status: true,
    isOnline: true,
    needAck: false,
    ackMsg: '',
    activeStatus: ''
  }
}

const icxModulesConst : {
  specialMaxSlots: { [index:string]: number },
  maxSlots: { [index:number]: number },
  rearSlots: { [index:number]: number[] }
} = {
  specialMaxSlots: { 'ICX7150-48ZP': 2 },
  //discribe the model maximum slots count
  maxSlots: { 715012: 3, 715024: 3, 715048: 3, 725024: 2, 725048: 2, 745024: 4, 745048: 4,
              755024: 3, 755048: 3, 765048: 3, 785032: 3, 785048: 2 },
  //includes (the following slots ports in the rear side)
  rearSlots: { 745024: [3, 4], 745048: [3, 4], 765048: [3] }
}

export function PanelSlotview (props:{
  switchDetail: SwitchViewModel, 
  member: StackMember,
  index: number,
  isStack: boolean
}) {
  const { $t } = useIntl()
  const [ slotMember, setSlotMember ] = useState(null as unknown as SlotMember)
  const [ isRearView, setIsRearView ] = useState(false)
  const { switchDetail, member, isStack } = props
  const { serialNumber, switchMac } = switchDetail

  // useEffect(() => {
  //   if (switchDetail) {
  //     genSlotViewData(switchDetail)
  //   }
  // }, [switchDetail])

  const genUnit = (switchMember: StackMember) => {
    const defaultStatusEnum = serialNumber === switchMember.serialNumber ?
    SwitchStatusEnum.NEVER_CONTACTED_CLOUD : SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED

    return {
      switchUnit: switchMember.unitId,
      model: !isEmpty(switchMember.model) ? switchMember.model : getSwitchModel(switchMember.serialNumber),
      serialNumber: switchMember.serialNumber,
      stackId: switchMember.id,
      poeUsage: getPoeUsage(switchMember as unknown as SwitchViewModel),
      unitStatus: {
        status: switchMember.deviceStatus,
        isOnline: switchMember.deviceStatus === SwitchStatusEnum.OPERATIONAL,
        needAck: isEmpty(switchMember.needAck) ? false : switchMember.needAck,
        ackMsg: getAckMsg(!!switchMember.needAck, switchMember.serialNumber, switchMember.newSerialNumber),
        activeStatus: isEmpty(switchMember.unitStatus) ? transformSwitchStatus(defaultStatusEnum) :
          switchMember.unitStatus
      }
    };
  }

  const getAckMsg = (needAck: boolean, serialNumber:string, newSerialNumber?:string) => {
    let ackMsg = '';
    if (needAck === true) {
      ackMsg = isEmpty(newSerialNumber) ?
      $t({ defaultMessage: 'Additional member detected' }) : 
      $t({ defaultMessage: 
          'Member switch replacement detected. Old S/N: {serialNumber}  > New S/N: {newSerialNumber}' },
          {serialNumber, newSerialNumber}
        )
    }
    return ackMsg;
  }

  const caculateIcxModules = (unit: any) => {
    let maxSlotsCount
    let rearSlots
    if (Number(icxModulesConst.specialMaxSlots[unit.model]) > 0) {
      maxSlotsCount = icxModulesConst.specialMaxSlots[unit.model];
    } else if (Number(icxModulesConst.maxSlots[unit.model.replace(/\D+/g, '')]) > 0) {
      maxSlotsCount = icxModulesConst.maxSlots[unit.model.replace(/\D+/g, '')];
    }
    if (!isNaN(icxModulesConst.rearSlots[unit.model.replace(/\D+/g, '')] as unknown as number) &&
        (undefined !== icxModulesConst.rearSlots[unit.model.replace(/\D+/g, '')])) {
      rearSlots = icxModulesConst.rearSlots[unit.model.replace(/\D+/g, '')];
    }
  }

  const unit = genUnit(member)
  const isSwitchOperational = isOperationalSwitch(switchDetail.deviceStatus as SwitchStatusEnum, 
    switchDetail.syncedSwitchConfig)

  const onClickViewMode = () => {
    setIsRearView(!isRearView)
  }

  const ViewModeButton = <Button 
    type='link' 
    size='small'
    disabled={!isStack && !isSwitchOperational}
    onClick={onClickViewMode}
  >
  { isRearView ? $t({ defaultMessage: 'Front View' }) : $t({ defaultMessage: 'Rear View' }) }
  </Button>

  return <div>
    {
      isStack &&  
      <UI.TitleBar>
        {ViewModeButton}
      </UI.TitleBar>
    }
    {
      !isStack && 
      <UI.TitleBar>
        {!isSwitchOperational && !isRearView ? 
          <Tooltip title={$t({defaultMessage: 'Switch must be operational before you can see rear view'})}>
            <span>{ViewModeButton}</span>
          </Tooltip> :
          ViewModeButton
        }
      </UI.TitleBar>
    }
  </div>
}