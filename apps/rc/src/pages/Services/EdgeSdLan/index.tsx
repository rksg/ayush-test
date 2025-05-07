import { Features }              from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady } from '@acx-ui/rc/components'

import { AddEdgeSdLan as AddEdgeSdLanL2oGRE }           from './L2oGRE/AddEdgeSdLan'
import { EdgeSdLanDetail as EdgeSdLanDetailL2oGRE }     from './L2oGRE/EdgeSdLanDetail'
import { EdgeSdLanTable as EdgeSdLanTableL2oGRE }       from './L2oGRE/EdgeSdLanTable'
import { EditEdgeSdLan as EditEdgeSdLanL2oGRE }         from './L2oGRE/EditEdgeSdLan'
import { AddEdgeSdLan as AddEdgeSdLanMultiVenue }       from './MultiVenue/AddEdgeSdLan'
import { EdgeSdLanDetail as EdgeSdLanDetailMultiVenue } from './MultiVenue/EdgeSdLanDetail'
import { EdgeSdLanTable as EdgeSdLanTableMultiVenue }   from './MultiVenue/EdgeSdLanTable'
import { EditEdgeSdLan as EditEdgeSdLanMultiVenue }     from './MultiVenue/EditEdgeSdLan'

export const AddEdgeSdLan = () => {
  const isL2oGREnabled = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)
  return isL2oGREnabled ? <AddEdgeSdLanL2oGRE /> : <AddEdgeSdLanMultiVenue />
}

export const EdgeSdLanDetail = () => {
  const isL2oGREnabled = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)
  return isL2oGREnabled ? <EdgeSdLanDetailL2oGRE /> : <EdgeSdLanDetailMultiVenue />
}

export const EdgeSdLanTable = () => {
  const isL2oGREnabled = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)
  return isL2oGREnabled ? <EdgeSdLanTableL2oGRE /> : <EdgeSdLanTableMultiVenue />
}

export const EditEdgeSdLan = () => {
  const isL2oGREnabled = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)
  return isL2oGREnabled ? <EditEdgeSdLanL2oGRE /> : <EditEdgeSdLanMultiVenue />
}