import { Button } from '@acx-ui/components'
import { useLazySwitchFrontViewQuery, useLazySwitchRearViewQuery } from '@acx-ui/rc/services'
import { getPoeUsage, getSwitchModel, getSwitchModelInfo, getSwitchPortLabel, isEmpty, isOperationalSwitch, StackMember, SwitchFrontView, SwitchModelInfo, SwitchRearView, SwitchRearViewUI, SwitchRearViewUISlot, SwitchSlot, SwitchStatusEnum, SwitchViewModel, transformSwitchUnitStatus } from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import Tooltip from 'antd/es/tooltip'
import _ from 'lodash'
import { useContext, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { SwitchDetailsContext } from '../../..'
import { FrontViewSlot } from './FrontViewSlot'
import { RearView } from './RearView'
import * as UI             from './styledComponents'

interface SlotMember {
  isStack: boolean
  data: StackMember[]
}

interface unitType {
  switchUnit: number
  model: string
  serialNumber: string
  stackId: string
  poeUsage: {
    used: number,
    total: number,
    percentage: string
  }
  unitStatus:{
    status: SwitchStatusEnum,
    isOnline: boolean,
    needAck: boolean,
    ackMsg: string,
    activeStatus: string
  }
}

const defaultUnit: unitType = {
  switchUnit: 1,
  model: '',
  serialNumber: '',
  stackId: '',
  poeUsage: {
    used: 0,
    total: 0,
    percentage: '--'
  },
  unitStatus: {
    status: SwitchStatusEnum.NEVER_CONTACTED_CLOUD,
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

/** 
 * GUI: Front View
 *    _______________________________________
 *   |  slot 1         slot 2   slot 3       |  
 *   |  [][][][][][]   [][][]   [][]         |
 *   |  [][][][][][]   [][][]   [][]-> port  |
 *   |_______________________________________|-> unit
 *   
 * 
 * GUI: Rear View
 *    _______________________________________
 *   |                                       |  
 *   |  [Power]                              |
 *   |  [Fan]                                |
 *   |_______________________________________|-> unit
 *   
*/

export function Unit (props:{
  member: StackMember,
  index: number,
  isStack: boolean,
  isOnline: boolean
}) {
  const { member, isStack, isOnline } = props
  const {
    switchDetailsContextData
  } = useContext(SwitchDetailsContext)

  const { switchDetailHeader: switchDetail } = switchDetailsContextData
  const { serialNumber, switchMac } = switchDetail

  const { $t } = useIntl()
  const [ slotMember, setSlotMember ] = useState(null as unknown as SlotMember)
  const [ isRearView, setIsRearView ] = useState(false)
  const [ maxSlotsCount, setMaxSlotsCount ] = useState(null as unknown as number)
  const [ rearSlots, setRearSlots ] = useState(null as unknown as number[])
  const [ unit, setUnit ] = useState(defaultUnit)
  const [ portView, setPortView ] = useState({
    slots: [{
      slotNumber: 1,
      isDataPort: false,
      fanStatus: {
        type: 'test',
        status: 'OK'
      },
      powerStatus: {
        type: 'AC',
        status: 'OK'
      },
      portStatus: [
        { portIdentifier: '' }
      ]
    }]
  } as SwitchFrontView)
  const [ rearView, setRearView ] = useState(null as unknown as SwitchRearViewUISlot)
  
  const [ switchFrontView ] = useLazySwitchFrontViewQuery()
  const [ switchRearView ] = useLazySwitchRearViewQuery()
  const { tenantId } = useParams()
  

  useEffect(() => {
    if (member) {
      const unitData = genUnit(member)
      setUnit(unitData as unitType)
      caculateIcxModules(unitData)
      if ((isOnline || member.deviceStatus === SwitchStatusEnum.DISCONNECTED) 
           && _.isInteger(member.unitId)) {
        getSwitchPortDetail(switchMac as string, serialNumber as string, member.unitId?.toString() as string)
      } else {
        getOfflineSwitchPort(member)
      }
    }
  }, [member])

  
  const getUnitSwitchModel = (switchMember: StackMember) => {
    return !isEmpty(switchMember.model) ? switchMember.model : getSwitchModel(switchMember.serialNumber)
  }
  const model = getUnitSwitchModel(member) as string

  const getSwitchPortDetail = async (switchMac: string, serialNumber: string, unitId: string) => {
    const { data: portStatus } = await switchFrontView({ params: { tenantId, switchId: switchMac || serialNumber, unitId } })
    const { data: rearStatus } = await switchRearView({ params: { tenantId, switchId: serialNumber, unitId } })  
    // handle front view data
    const tmpPortView = JSON.parse(JSON.stringify(portStatus)) 
    tmpPortView.slots.forEach((slot:SwitchSlot) => {
      if (slot.portStatus !== undefined) {
        slot.slotNumber = Number(slot.portStatus[0].portIdentifier.split('/')[1])
        const { cloudPort } = switchDetail
        if (cloudPort) {
          slot.portStatus.forEach(port => {
            if (port.portIdentifier === cloudPort) {
              port.usedInUplink = true
            }
          })
        }
      }
    })
    setPortView(tmpPortView as SwitchFrontView)
    
    // handle rear view data
    const fanRearStatus = _.isEmpty(rearStatus?.fanStatus) ? [] : rearStatus?.fanStatus;
    const powerRearStatus = _.isEmpty(rearStatus?.powerStatus) ? [] : rearStatus?.powerStatus;
    const switchModelInfo = getSwitchModelInfo(model);
    const slotsCount = Math.max(switchModelInfo?.powerSlots as number, switchModelInfo?.fanSlots as number);

    // The backend is not sort by slotNumber, so we need to sort it.
    fanRearStatus?.sort((a, b) => a.slotNumber - b.slotNumber);
    powerRearStatus?.sort((a, b) => a.slotNumber - b.slotNumber);

    const tmpRearView = {
      slots: []
    } as SwitchRearViewUISlot
    for (let i = 0 ; i < slotsCount ; i++) {
      const notPrsesentSlotObj = {
        slotNumber : i + 1 ,
        type: '',
        status: 'NOT_PRESENT'
      };

      tmpRearView.slots.push({
        slotNumber : i + 1,
        fanStatus: fanRearStatus && !_.isEmpty(fanRearStatus[i]) ? fanRearStatus[i]: notPrsesentSlotObj,
        powerStatus: powerRearStatus && !_.isEmpty(powerRearStatus[i]) ? powerRearStatus[i]: notPrsesentSlotObj
      });
    }
    setRearView(tmpRearView)
  }

  const getOfflineSwitchPort = (member: StackMember) => {
    const portStatus = [];
    const portCount = Number(member.model?.split('-')[1].replace(/\D/g, ''));

    for (let i = 1; i < portCount + 1; i++) {
      portStatus.push({
        portIdentifier: '1/1/' + i,
        portnumber : i,
        status : 'Offline'
      });
    }

    const tmpPort = {
      slots: [{
        slotNumber: 1,
        isDataPort: false,
        fanStatus: {
          type: 'test',
          status: 'OK'
        },
        powerStatus: {
          type: 'AC',
          status: 'OK'
        },
        portStatus
      }]
    }
    setPortView(tmpPort as unknown as SwitchFrontView)

    const tmpRear = {
      slots: [{
        slotNumber: 1
      }]
    }
    setRearView(tmpRear)
  }

  const genUnit = (switchMember: StackMember) => {
    const defaultStatusEnum = serialNumber === switchMember.serialNumber ?
    SwitchStatusEnum.NEVER_CONTACTED_CLOUD : SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED

    return {
      switchUnit: switchMember.unitId,
      model: getUnitSwitchModel(switchMember),
      serialNumber: switchMember.serialNumber,
      stackId: switchMember.id,
      poeUsage: getPoeUsage(switchMember as unknown as SwitchViewModel),
      unitStatus: {
        status: switchMember.deviceStatus,
        isOnline,
        needAck: isEmpty(switchMember.needAck) ? false : switchMember.needAck,
        ackMsg: getAckMsg(!!switchMember.needAck, switchMember.serialNumber, switchMember.newSerialNumber),
        activeStatus: isEmpty(switchMember.unitStatus) ? transformSwitchUnitStatus(defaultStatusEnum) :
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
    if (Number(icxModulesConst.specialMaxSlots[unit.model]) > 0) {
      setMaxSlotsCount(icxModulesConst.specialMaxSlots[unit.model])
    } else if (Number(icxModulesConst.maxSlots[unit.model.replace(/\D+/g, '')]) > 0) {
      setMaxSlotsCount(icxModulesConst.maxSlots[unit.model.replace(/\D+/g, '')])
    }
    if (!isNaN(icxModulesConst.rearSlots[unit.model.replace(/\D+/g, '')] as unknown as number) &&
        (undefined !== icxModulesConst.rearSlots[unit.model.replace(/\D+/g, '')])) {
      setRearSlots(icxModulesConst.rearSlots[unit.model.replace(/\D+/g, '')])
    }
  }

  const isSwitchOperational = isOperationalSwitch(switchDetail.deviceStatus as SwitchStatusEnum, 
    switchDetail.syncedSwitchConfig)

  const getPortLabel = (slot: any) => {
    const slotNumber = Number(slot.portStatus[0].portIdentifier.split('/')[1]);
    return getSwitchPortLabel(member.model as string, slotNumber)
  }

  const onClickViewMode = () => {
    setIsRearView(!isRearView)
  }

  const ViewModeButton = <Button 
      type='link' 
      size='small'
      disabled={!isSwitchOperational}
      onClick={onClickViewMode}
    >
    { isRearView ? $t({ defaultMessage: 'Front View' }) : $t({ defaultMessage: 'Rear View' }) }
    </Button>

  return <div>
    <UI.TitleBar>
      {
        isStack && 
        <>
        {
          isOnline 
          ? <>
              <div>{unit.switchUnit}</div>
              <div>{unit.model}</div>
              { unit.unitStatus.needAck 
                ? <div>{unit.unitStatus.ackMsg}</div>
                : <span>{unit.poeUsage.used} / {unit.poeUsage.total} ({unit.poeUsage.percentage})</span>
              }
            </>
          : <>
              <div className='unit-header'>{unit.switchUnit}</div>
              <div className='model'>{unit.model}</div>
              <div className='icon'>
                <UI.SettingsIcon />
              </div>
              <div className='status'>
                { unit.unitStatus && unit.unitStatus.needAck 
                  ? unit.unitStatus.ackMsg
                  : unit.unitStatus.activeStatus
                }
              </div>
            
            </>
        }
        </>
      }
      <div className='view-button'>
        {!isSwitchOperational && !isRearView ? 
          <Tooltip title={$t({defaultMessage: 'Switch must be operational before you can see rear view'})}>
            <span>{ViewModeButton}</span>
          </Tooltip> :
          ViewModeButton
        }
      </div>
    </UI.TitleBar>
    <UI.UnitWrapper>
      { !isRearView 
        ? <>
            {
              portView && portView.slots.map((slot, index) => (
                <FrontViewSlot key={index} slot={slot} 
                  isOnline={isOnline} isStack={isStack} 
                  deviceStatus={switchDetail.deviceStatus as SwitchStatusEnum}
                  portLabel={getPortLabel(slot) as string}
                />
              ))
            }
          </>
        : <>
            {
              rearView && rearView.slots.map((slot, index) => (
                <RearView key={index} slot={slot} 
                  switchModelInfo={getSwitchModelInfo(model) as SwitchModelInfo} 
                />
              ))
            }
          </>
      }
    </UI.UnitWrapper>
  </div>
}