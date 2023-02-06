import { StackMember, SwitchStatusEnum, SwitchViewModel } from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { SwitchDetailsContext } from '../..'
import { PanelSlotview } from './PanelSlotview'

interface SlotMember {
  isStack: boolean
  data: StackMember[]
}

export function SwitchOverviewPanel (props:{
  stackMember: StackMember[]}) {
  const { serialNumber } = useParams()
  const [ slotMember, setSlotMember ] = useState(null as unknown as SlotMember)
  const { stackMember } = props
  const {
    switchDetailsContextData
  } = useContext(SwitchDetailsContext)

  const { switchDetailHeader: switchDetail } = switchDetailsContextData

  useEffect(() => {
    if (stackMember) {
      genSlotViewData()
    }
  }, [stackMember])

  const genSlotViewData = () => {
    if (switchDetail.isStack || switchDetail.formStacking) {
      setSlotMember({
        isStack: true,
        data: stackMember
      })
    } else {
      setSlotMember({
        isStack: false,
        data: [{
            deviceStatus: switchDetail.deviceStatus,
            id: serialNumber,
            model: switchDetail.model,
            serialNumber: switchDetail.serialNumber,
            switchMac: switchDetail.switchMac,
            unitId: 1,
            unitStatus: '',
            uptime: switchDetail.uptime,
            venueName: switchDetail.venueName
          } as unknown as StackMember]
      })
    }
  }
  
  return <>{
    slotMember && slotMember.data.map((member, index) => (
      <span key={index}>
        <PanelSlotview member={member} index={index}
          isStack={slotMember.isStack} isOnline={member.deviceStatus === SwitchStatusEnum.OPERATIONAL}/>
      </span>  
    ))
  }</>
}