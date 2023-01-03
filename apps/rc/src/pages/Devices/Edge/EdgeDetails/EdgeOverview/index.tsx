import { useParams } from 'react-router-dom'
import styled        from 'styled-components/macro'

import { GridCol, GridRow }  from '@acx-ui/components'
import {
  EdgeInfoWidget,
  EdgeTrafficByVolumeWidget,
  EdgeResourceUtilizationWidget,
  EdgePortsByTrafficWidget
} from '@acx-ui/rc/components'
import { useEdgeBySerialNumberQuery }                 from '@acx-ui/rc/services'
import { EdgePortView, EdgeStatus, EdgePortTypeEnum } from '@acx-ui/rc/utils'

import { EdgeUpTimeWidget } from './EdgeUpTimeWidget'

export const EdgeOverview = styled(({ className }:{ className?: string }) => {
  const params = useParams()

  const edgeStatusPayload = {
    fields: [
      'name',
      'venueName',
      'type',
      'serialNumber',
      'ports',
      'ip',
      'model',
      'fwVersion',
      'deviceStatus',
      'deviceSeverity',
      'venueId',
      'tags'
    ],
    filters: { serialNumber: [params.serialNumber] } }

  const { data: currentEdge, isLoading: isLoadingEdgeStatus } = useEdgeBySerialNumberQuery({
    params, payload: edgeStatusPayload
  })

  // TODO: used fake data to wait for API
  const isPortListLoading = false
  const edgePortsSetting: EdgePortView[] = [{
    portId: '1',
    portName: 'Port 1',
    status: 'Up',
    adminStatus: 'Enabled',
    portType: EdgePortTypeEnum.WAN,
    mac: 'AA:BB:CC:DD:EE:FF',
    speed: 12* Math.pow(12, 6),
    duplexSpeed: 100* Math.pow(12, 6),
    ip: '1.1.1.1'
  },
  {
    portId: '2',
    portName: 'Port 2',
    status: 'Down',
    adminStatus: 'Disabled',
    portType: EdgePortTypeEnum.LAN,
    mac: 'AA:BB:CC:DD:EE:FF',
    speed: 10* Math.pow(12, 6),
    duplexSpeed: 100* Math.pow(12, 6),
    ip: '1.1.1.2'
  }]

  // TODO: wait for API
  //   const { data: edgePortsSetting, isLaoding: isPortListLoading } = useEdgePortsListQuery({
  //     params: { tenantId, serialNumber }
  //   })

  return (
    <GridRow className={className}>
      <GridCol col={{ span: 24 }}>
        <EdgeInfoWidget
          currentEdge={currentEdge as EdgeStatus}
          edgePortsSetting={edgePortsSetting as EdgePortView[]}
          isEdgeStatusLoading={isLoadingEdgeStatus}
          isPortListLoading={isPortListLoading}
        />
      </GridCol>

      {/* TODO: wait for API*/}
      <GridCol col={{ span: 24 }} className='statistic upTimeWidget'>
        <EdgeUpTimeWidget />
      </GridCol>

      {/* TODO: wait for API*/}
      <GridCol col={{ span: 12 }} className='statistic'>
        <EdgeTrafficByVolumeWidget />
      </GridCol>
      {/* TODO: wait for API*/}
      <GridCol col={{ span: 12 }} className='statistic'>
        <EdgeResourceUtilizationWidget />
      </GridCol>
      {/* TODO: wait for API*/}
      <GridCol col={{ span: 12 }} className='statistic'>
        <EdgePortsByTrafficWidget
          edgePortsSetting={edgePortsSetting as EdgePortView[]}
          isLoading={isPortListLoading}
        />
      </GridCol>
    </GridRow>

  )
})`
div.statistic {
    height: 280px;

    &.upTimeWidget {
      height: 100px;
    }
}
`