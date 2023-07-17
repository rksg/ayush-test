/* eslint-disable max-len */
import { useContext, useEffect, useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Button, Descriptions, Drawer, showActionModal, Tooltip }                                                                                                                                                  from '@acx-ui/components'
import { useAcknowledgeSwitchMutation, useDeleteStackMemberMutation, useLazySwitchPortlistQuery, useLazySwitchRearViewQuery }                                                                                      from '@acx-ui/rc/services'
import { getPoeUsage, getSwitchModel, getSwitchPortLabel, isEmpty, StackMember, SwitchFrontView, SwitchModelInfo, SwitchRearViewUISlot, SwitchSlot, SwitchStatusEnum, SwitchViewModel, transformSwitchUnitStatus } from '@acx-ui/rc/utils'
import { useParams }                                                                                                                                                                                               from '@acx-ui/react-router-dom'

import { SwitchDetailsContext } from '../../..'

import { FrontViewSlot }    from './FrontViewSlot'
import { FrontViewTooltip } from './FrontViewTooltip'
import { RearView }         from './RearView'
import * as UI              from './styledComponents'

import { SwitchPannelContext } from '.'
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
  const {
    editPortsFromPanelEnabled
  } = useContext(SwitchPannelContext)
  const [ deleteStackMember ] = useDeleteStackMemberMutation()
  const [ acknowledgeSwitch ] = useAcknowledgeSwitchMutation()
  const { switchDetailHeader: switchDetail } = switchDetailsContextData
  const { serialNumber, switchMac } = switchDetail

  const { $t } = useIntl()
  const [ visible, setVisible ] = useState(false)
  const [ isRearView, setIsRearView ] = useState(false)
  const [ enableDeleteStackMember, setEnableDeleteStackMember ] = useState(false)
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
  const [ switchSlots, setSwitchSlots ] = useState({
    fanSlots: 0,
    powerSlots: 0
  })

  const [ switchRearView ] = useLazySwitchRearViewQuery()
  const [ switchPortlist ] = useLazySwitchPortlistQuery()
  const { tenantId, switchId } = useParams()


  useEffect(() => {
    if (member) {
      const unitData = genUnit(member)
      setUnit(unitData as unitType)
      setEnableDeleteStackMember(isStack && isEmpty(member.unitStatus) && !unitData.unitStatus.needAck &&
        (member.serialNumber !== serialNumber))
      if ((isOnline || member.deviceStatus === SwitchStatusEnum.DISCONNECTED)
           && _.isInteger(member.unitId)) {
        getSwitchPortDetail(switchMac as string, serialNumber as string, member.unitId?.toString() as string)
      } else {
        getOfflineSwitchPort(unitData.model as string)
      }
    }
  }, [member])

  const getUnitSwitchModel = (switchMember: StackMember) => {
    return !isEmpty(switchMember.model) ? switchMember.model : getSwitchModel(switchMember.serialNumber)
  }

  const getSwitchPortDetail = async (switchMac: string, serialNumber: string, unitId: string) => {
    const { data: rearStatus } = await switchRearView({ params: { tenantId, switchId: serialNumber, unitId } })
    const { data: portsData } = await switchPortlist({
      params: { tenantId },
      payload: {
        filters: { switchId: [serialNumber] },
        sortField: 'portIdentifierFormatted',
        sortOrder: 'ASC',
        page: 1,
        pageSize: 10000,
        fields: ['portIdentifier', 'name', 'status', 'adminStatus', 'portSpeed',
          'poeUsed', 'vlanIds', 'neighborName', 'tag', 'cog', 'cloudPort', 'portId', 'switchId',
          'switchSerial', 'switchMac', 'switchName', 'switchUnitId', 'switchModel',
          'unitStatus', 'unitState', 'deviceStatus', 'poeEnabled', 'poeTotal', 'unTaggedVlan',
          'lagId', 'syncedSwitchConfig', 'ingressAclName', 'egressAclName', 'usedInFormingStack',
          'id', 'poeType', 'signalIn', 'signalOut', 'lagName', 'opticsType',
          'broadcastIn', 'broadcastOut', 'multicastIn', 'multicastOut', 'inErr', 'outErr',
          'crcErr', 'inDiscard', 'usedInFormingStack', 'mediaType', 'poeUsage',
          'neighborMacAddress'
        ]
      }
    })
    const portStatusData = {
      slots: [] as SwitchSlot[]
    }
    const tmpSlots: { [key:string]:SwitchSlot } = {}

    portsData?.data
      .filter(port => port.portIdentifier.split('/')[0] === unitId)
      .forEach(item => {
        const port = { ...item }
        port.portnumber = port.portIdentifier.split('/')[2]
        const slot = Number(port.portIdentifier.split('/')[1])

        if(tmpSlots[slot]){
          tmpSlots[slot].portStatus.push(port)
          tmpSlots[slot].portCount++
        }else {
          tmpSlots[slot] = {
            portStatus: [port],
            portCount: 1
          }
        }
      })
    Object.keys(tmpSlots).forEach(key => {
      portStatusData.slots.push(tmpSlots[key])
    })

    // handle front view data
    const tmpPortView = JSON.parse(JSON.stringify(portStatusData))
    tmpPortView.unitNumber = unitId
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

    // Handle rear view data: The backend is not sort by slotNumber, so we need to sort it.
    const fanRearStatus = _.isEmpty(rearStatus?.fanStatus) ? [] : rearStatus?.fanStatus?.slice().sort((a, b) => a.slotNumber - b.slotNumber)
    const powerRearStatus = _.isEmpty(rearStatus?.powerStatus) ? [] : rearStatus?.powerStatus?.slice().sort((a, b) => a.slotNumber - b.slotNumber)
    const switchModelInfo = {
      fanSlots: fanRearStatus?.length || 0,
      powerSlots: powerRearStatus?.length || 0
    }
    setSwitchSlots(switchModelInfo)
    const slotsCount = Math.max(switchModelInfo?.powerSlots as number, switchModelInfo?.fanSlots as number)

    const tmpRearView = {
      slots: []
    } as SwitchRearViewUISlot
    for (let i = 0 ; i < slotsCount ; i++) {
      const notPrsesentSlotObj = {
        slotNumber: i + 1 ,
        type: '',
        status: 'NOT_PRESENT'
      }

      tmpRearView.slots.push({
        slotNumber: i + 1,
        fanStatus: fanRearStatus && !_.isEmpty(fanRearStatus[i]) ? fanRearStatus[i]: notPrsesentSlotObj,
        powerStatus: powerRearStatus && !_.isEmpty(powerRearStatus[i]) ? powerRearStatus[i]: notPrsesentSlotObj
      })
    }
    setRearView(tmpRearView)
  }

  const getOfflineSwitchPort = (model: string) => {
    const portStatus = []
    const portCount = Number(model?.split('-')[1].replace(/\D/g, '').slice(0, 2))

    for (let i = 1; i < portCount + 1; i++) {
      portStatus.push({
        portIdentifier: '1/1/' + i,
        portnumber: i,
        status: 'Offline'
      })
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
      model: switchMember.model || getUnitSwitchModel(switchMember),
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
    }
  }

  const getAckMsg = (needAck: boolean, serialNumber:string, newSerialNumber?:string) => {
    let ackMsg = ''
    if (needAck === true) {
      ackMsg = isEmpty(newSerialNumber) ?
        $t({ defaultMessage: 'Additional member detected' }) :
        $t({ defaultMessage:
          'Member switch replacement detected. Old S/N: {serialNumber}  > New S/N: {newSerialNumber}' },
        { serialNumber, newSerialNumber }
        )
    }
    return ackMsg
  }

  const getPortLabel = (slot: SwitchSlot) => {
    const slotNumber = Number(slot.portStatus[0].portIdentifier.split('/')[1])
    return getSwitchPortLabel(member.model as string, slotNumber)
  }

  const onClickViewMode = () => {
    setIsRearView(!isRearView)
  }

  const onClickRemove = () => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'Switch' }),
        entityValue: unit.model,
        numOfEntities: 1
      },
      onOk: () => {
        deleteStackMember({ params: { tenantId, stackSwitchSerialNumber: unit.serialNumber } })
      }
    })
  }

  const onClickUnit = () => {
    setVisible(true)
  }

  const onClickAck = () => {
    const ackPayload = {
      add: [] as string[],
      remove: [] as string[]
    }
    if (!isEmpty(member.newSerialNumber)) {
      ackPayload.add.push(member.newSerialNumber as string)
      ackPayload.remove.push(unit.serialNumber)
    } else {
      ackPayload.add.push(unit.serialNumber)
    }

    acknowledgeSwitch({ params: { tenantId, switchId }, payload: ackPayload })
  }

  const ViewModeButton = <Button
    type='link'
    size='small'
    disabled={!isOnline}
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
                <div className={isOnline ? 'unit-header operational' : 'unit-header'}>{unit.switchUnit}</div>
                <div className='model'>{unit.model}</div>
                { unit.unitStatus && unit.unitStatus.needAck
                  ? <>
                    <div className='icon'>
                      <UI.SettingsIcon />
                    </div>
                    <div className='status'>{unit.unitStatus.ackMsg}</div>
                    <div className='status'>
                      <span className='unit-button' onClick={onClickAck}>
                        {$t({ defaultMessage: 'Acknowledge' })}
                      </span>
                    </div>
                  </>
                  : <div className='status'>
                    <span className='unit-button' onClick={onClickUnit}>
                      {unit.unitStatus.activeStatus}
                    </span>
                  </div>
                }
                <div className='icon'>
                  <UI.RearPowerIcon />
                </div>
                <div className='status'>{unit.poeUsage.used} W / {unit.poeUsage.total} W ({unit.poeUsage.percentage})</div>
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
        {
          enableDeleteStackMember &&
          <Button
            type='link'
            size='small'
            style={{ paddingRight: '20px' }}
            onClick={onClickRemove}
          >
            {$t({ defaultMessage: 'Remove' })}
          </Button>
        }
        {!isOnline && !isRearView ?
          <Tooltip title={$t({ defaultMessage: 'Switch must be operational before you can see rear view' })}>
            <span>{ViewModeButton}</span>
          </Tooltip> :
          ViewModeButton
        }
      </div>
    </UI.TitleBar>
    {
      (editPortsFromPanelEnabled && !isRearView && props.index === 0) && (
        <UI.FrontViewTooltipContainer>
          <FrontViewTooltip />
        </UI.FrontViewTooltipContainer>
      )
    }
    <UI.UnitWrapper>
      { !isRearView
        ? <>
          {
            portView && portView.slots.map((slot, index) => (
              <FrontViewSlot key={index}
                slot={slot}
                isOnline={isOnline}
                isStack={isStack}
                deviceStatus={switchDetail.deviceStatus as SwitchStatusEnum}
                portLabel={getPortLabel(slot) as string}
              />
            ))
          }
        </>
        : <>
          {
            rearView && rearView.slots.map((slot, index) => (
              <UI.RearSlotWrapper key={index}>
                <RearView
                  slot={slot}
                  switchModelInfo={switchSlots as SwitchModelInfo}
                />
              </UI.RearSlotWrapper>
            ))
          }
        </>
      }
      {visible && <UnitDrawer
        switchUnit={unit}
        visible={visible}
        onClose={()=>setVisible(false)}
      /> }
    </UI.UnitWrapper>
  </div>
}

function UnitDrawer (props:{
  switchUnit: unitType,
  visible: boolean,
  onClose: () => void
}) {
  const { $t } = useIntl()
  const { switchUnit, visible, onClose } = props
  return <Drawer
    width={'450px'}
    title={$t({ defaultMessage: 'Switch {model}' }, { model: switchUnit.model })}
    visible={visible}
    onClose={onClose}
    children={
      <Descriptions labelWidthPercent={50}>
        <Descriptions.Item
          label={$t({ defaultMessage: 'Stack membership' })}
          children={switchUnit.unitStatus.activeStatus}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Stack ID' })}
          children={switchUnit.stackId}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Status' })}
          children={switchUnit.unitStatus.status}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Model' })}
          children={switchUnit.model}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Serial number' })}
          children={switchUnit.serialNumber}
        />
      </Descriptions>
    }
  />
}
