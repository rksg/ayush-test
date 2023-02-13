import { useContext, useEffect, useState } from 'react'
import { useParams } from '@acx-ui/react-router-dom'
import { SwitchesTrafficByVolume } from '@acx-ui/analytics/components'
import { AnalyticsFilter }         from '@acx-ui/analytics/utils'
import { StackMember, SwitchStatusEnum } from '@acx-ui/rc/utils'
import { GridCol, GridRow }        from '@acx-ui/components'

import { ResourceUtilization } from './ResourceUtilization'
import { TopPorts }            from './TopPorts'

import { SwitchDetailsContext } from '../..'
import { PanelSlotview } from './PanelSlotview'

interface SlotMember {
  isStack: boolean
  data: StackMember[]
}

export function SwitchOverviewPanel (props:{
  filters: AnalyticsFilter,
  stackMember: StackMember[]
}) {
  const { filters } = props
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

  return <GridRow>
    <GridCol col={{ span: 24 }} style={{ height: '280px' }}>
      <>
        {
          slotMember && slotMember.data.map((member, index) => (
            <span key={index}>
              <PanelSlotview member={member} index={index}
                isStack={slotMember.isStack} isOnline={member.deviceStatus === SwitchStatusEnum.OPERATIONAL}/>
            </span>  
          ))
        }
      </>
    </GridCol>
    { filters && <SwitchWidgets filters={{ ...filters }}/> }
  </GridRow>
}

function SwitchWidgets (props: { filters: AnalyticsFilter }) {
  const filters = props.filters
  return (
    <>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <SwitchesTrafficByVolume filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <ResourceUtilization filters={filters} />
      </GridCol>
      <GridCol col={{ span: 8 }} style={{ height: '280px' }}>
        <TopPorts filters={{ ...filters, by: 'traffic' }} type='donut' />
      </GridCol>
      <GridCol col={{ span: 16 }} style={{ height: '280px' }}>
        <TopPorts filters={{ ...filters, by: 'traffic' }} type='line' />
      </GridCol>
      <GridCol col={{ span: 8 }} style={{ height: '280px' }}>
        <TopPorts filters={{ ...filters, by: 'error' }} type='donut' />
      </GridCol>
      <GridCol col={{ span: 16 }} style={{ height: '280px' }}>
        <TopPorts filters={{ ...filters, by: 'error' }} type='line' />
      </GridCol>
    </>
  )
}