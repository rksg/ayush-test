import { useParams } from 'react-router-dom'

import { useApViewModelQuery, useSwitchDetailHeaderQuery } from '@acx-ui/rc/services'
import { ApViewModel, DeviceTypes, Node, SwitchViewModel } from '@acx-ui/rc/utils'

import { APDetailsCard }     from './APDetailsCard'
import { SwitchDetailsCard } from './SwitchDetailsCard'

export default function NodeTooltip (props: { tooltipPosition: {
    x: number,
    y: number,
},
tooltipNode: Node,
closeTooltip: Function
}) {

  const { tooltipPosition, tooltipNode, closeTooltip } = props
  const params = useParams()

  const defaultApPayload = {
    fields: [
      'name',
      'venueName',
      'deviceGroupName',
      'description',
      'lastSeenTime',
      'serialNumber',
      'apMac',
      'IP',
      'extIp',
      'model',
      'fwVersion',
      'meshRole',
      'hops',
      'apUpRssi',
      'deviceStatus',
      'deviceStatusSeverity',
      'isMeshEnable',
      'lastUpdTime',
      'deviceModelType',
      'apStatusData.APSystem.uptime',
      'venueId',
      'uplink',
      'apStatusData',
      'apStatusData.cellularInfo',
      'healthStatus',
      'clients',
      'downLinkCount'
    ]
  }

  const { data: apList, isLoading: apLoading } = useApViewModelQuery({ params,
    payload: { ...defaultApPayload,
      filters: {
        serialNumber: [
          tooltipNode?.serialNumber || tooltipNode?.serial
        ]
      }
    }
  },
  { skip: skipAPCall(tooltipNode?.type as DeviceTypes)
  })

  const { data: switchDetail, isLoading: switchLoading } =
    useSwitchDetailHeaderQuery({ params: { ...params, switchId: tooltipNode?.id } },
      { skip: skipSwitchCall(tooltipNode?.type as DeviceTypes) })


  function skipAPCall (deviceType: DeviceTypes): boolean {
    return ![DeviceTypes.Ap, DeviceTypes.ApMesh, DeviceTypes.ApMeshRoot, DeviceTypes.ApWired]
      .includes(deviceType)
  }

  function skipSwitchCall (deviceType: DeviceTypes): boolean {
    return ![DeviceTypes.Switch, DeviceTypes.SwitchStack]
      .includes(deviceType)
  }

  const closeHandler = () => {
    closeTooltip(tooltipNode)
  }

  return <div
    data-testid='nodeTooltip'
    style={{
      position: 'absolute',
      width: '348px',
      maxHeight: '350px',
      top: tooltipPosition.y - 100,
      left: tooltipPosition.x + 5,
      zIndex: 9999
    }}>
    {
      (tooltipNode?.type === DeviceTypes.Switch || tooltipNode?.type === DeviceTypes.SwitchStack)
        ? <SwitchDetailsCard
          switchDetail={switchDetail as SwitchViewModel}
          isLoading={switchLoading}
          onClose={closeHandler}/>
        : <APDetailsCard
          apDetail={apList as ApViewModel}
          isLoading={apLoading}
          onClose={closeHandler}/>
    }
  </div>
}
