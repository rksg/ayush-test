import { useContext, useEffect, useState } from 'react'

import { StackMember, SwitchStatusEnum } from '@acx-ui/rc/utils'
import { useParams }                     from '@acx-ui/react-router-dom'

import { SwitchDetailsContext } from '../../..'

import * as UI  from './styledComponents'
import { Unit } from './Unit'

interface SlotMember {
  isStack: boolean
  data: StackMember[]
}

export function SwitchFrontRearView (props:{
  stackMember: StackMember[]
}) {
  const { stackMember } = props
  const { serialNumber } = useParams()
  const {
    switchDetailsContextData
  } = useContext(SwitchDetailsContext)
  const { switchDetailHeader: switchDetail } = switchDetailsContextData
  const [ slotMember, setSlotMember ] = useState(null as unknown as SlotMember)


  useEffect(() => {
    if (stackMember && switchDetail) {
      genSlotViewData()
    }
  }, [stackMember, switchDetail])


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

  return <>
    {
      slotMember && slotMember.data.map((member, index) => (
        <UI.SwitchFrontRearViewWrapper key={index}>
          <Unit member={member}
            index={index}
            isStack={slotMember.isStack}
            isOnline={member.deviceStatus === SwitchStatusEnum.OPERATIONAL}/>
        </UI.SwitchFrontRearViewWrapper>
      ))
    }
  </>
}