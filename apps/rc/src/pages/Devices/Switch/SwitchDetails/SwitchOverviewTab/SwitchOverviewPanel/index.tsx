import { StackMember, SwitchViewModel } from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { useEffect, useState } from 'react'
import { PanelSlotview } from './PanelSlotview'

interface SlotMember {
  isStack: boolean
  data: StackMember[]
}

export function SwitchOverviewPanel (props:{
  switchDetail: SwitchViewModel, stackMember: StackMember[]}) {
  const { serialNumber } = useParams()
  const [ slotMember, setSlotMember ] = useState(null as unknown as SlotMember)
  const { switchDetail, stackMember } = props

  useEffect(() => {
    if (switchDetail && stackMember) {
      genSlotViewData(switchDetail)
    }
  }, [switchDetail, stackMember])

  const genSlotViewData = (switchDetail: SwitchViewModel) => {
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
        <PanelSlotview member={member} index={index} isStack={slotMember.isStack} switchDetail={switchDetail} />
      </span>  
    ))
  }</>
}