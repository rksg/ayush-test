import { Features }              from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady } from '@acx-ui/rc/components'

import AddEdgeMvSdLan    from './multiVenue/AddEdgeSdLan'
import EditEdgeMvSdLan   from './multiVenue/EditEdgeSdLan'
import AddEdgeSdLanP1    from './P1/AddEdgeSdLan'
import EdgeSdLanDetailP1 from './P1/EdgeSdLanDetail'
import EdgeSdLanTableP1  from './P1/EdgeSdLanTable'
import EditEdgeSdLanP1   from './P1/EditEdgeSdLan'
import AddEdgeSdLanP2    from './P2/AddEdgeSdLan'
import EdgeSdLanDetailP2 from './P2/EdgeSdLanDetail'
import EdgeSdLanTableP2  from './P2/EdgeSdLanTable'
import EditEdgeSdLanP2   from './P2/EditEdgeSdLan'

export const EdgeSdLanTable = () => {
  const isEdgeSdLanEnabled = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaEnabled = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)

  if (!(isEdgeSdLanHaEnabled || isEdgeSdLanEnabled || isEdgeSdLanMvEnabled))
  // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>

  return isEdgeSdLanHaEnabled ? <EdgeSdLanTableP2 /> : <EdgeSdLanTableP1 />
}

export const EdgeSdLanDetail = () => {
  const isEdgeSdLanEnabled = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaEnabled = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)

  if (!(isEdgeSdLanHaEnabled || isEdgeSdLanEnabled || isEdgeSdLanMvEnabled))
  // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>

  return isEdgeSdLanHaEnabled ? <EdgeSdLanDetailP2 /> : <EdgeSdLanDetailP1 />
}

export const AddEdgeSdLan = () => {
  const isEdgeSdLanEnabled = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaEnabled = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)

  if (!(isEdgeSdLanHaEnabled || isEdgeSdLanEnabled || isEdgeSdLanMvEnabled))
  // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>

  return isEdgeSdLanMvEnabled
    ? <AddEdgeMvSdLan />
    : (isEdgeSdLanHaEnabled ? <AddEdgeSdLanP2 /> : <AddEdgeSdLanP1 />)
}

export const EditEdgeSdLan = () => {
  const isEdgeSdLanEnabled = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaEnabled = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)

  if (!(isEdgeSdLanHaEnabled || isEdgeSdLanEnabled || isEdgeSdLanMvEnabled))
  // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>

  return isEdgeSdLanMvEnabled
    ? <EditEdgeMvSdLan />
    : (isEdgeSdLanHaEnabled ? <EditEdgeSdLanP2 /> : <EditEdgeSdLanP1 />)
}