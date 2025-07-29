import { Features }                          from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }             from '@acx-ui/rc/utils'
import { TenantType, useUserProfileContext } from '@acx-ui/user'

import { AddEdgeSdLan as AddEdgeSdLanRec }       from './AddEdgeSdLan'
import { EdgeSdLanDetail as EdgeSdLanDetailRec } from './EdgeSdLanDetail'
import { EdgeSdLanTable as EdgeSdLanTableRec }   from './EdgeSdLanTable'
import { EditEdgeSdLan as EditEdgeSdLanRec }     from './EditEdgeSdLan'
import { AddEdgeSdLan as AddEdgeSdLanMsp }       from './Msp/AddEdgeSdLan'
import { EdgeSdLanDetail as EdgeSdLanDetailMsp } from './Msp/EdgeSdLanDetail'
import { EdgeSdLanTable as EdgeSdLanTableMsp }   from './Msp/EdgeSdLanTable'
import { EditEdgeSdLan as EditEdgeSdLanMsp }     from './Msp/EditEdgeSdLan'

const useIsMspUser = () => {
  const { tenantType } = useUserProfileContext()
  return tenantType === TenantType.MSP || tenantType === TenantType.MSP_NON_VAR
}

export const AddEdgeSdLan = () => {
  const isMspUser = useIsMspUser()
  const isEdgeDelegationReady = useIsEdgeFeatureReady(Features.EDGE_DELEGATION_TOGGLE)
  return isMspUser && isEdgeDelegationReady ? <AddEdgeSdLanMsp /> : <AddEdgeSdLanRec />
}

export const EdgeSdLanDetail = () => {
  const isMspUser = useIsMspUser()
  const isEdgeDelegationReady = useIsEdgeFeatureReady(Features.EDGE_DELEGATION_TOGGLE)
  return isMspUser && isEdgeDelegationReady ? <EdgeSdLanDetailMsp /> : <EdgeSdLanDetailRec />
}

export const EdgeSdLanTable = () => {
  const isMspUser = useIsMspUser()
  const isEdgeDelegationReady = useIsEdgeFeatureReady(Features.EDGE_DELEGATION_TOGGLE)
  return isMspUser && isEdgeDelegationReady ? <EdgeSdLanTableRec /> : <EdgeSdLanTableRec />
}

export const EditEdgeSdLan = () => {
  const isMspUser = useIsMspUser()
  const isEdgeDelegationReady = useIsEdgeFeatureReady(Features.EDGE_DELEGATION_TOGGLE)
  return isMspUser && isEdgeDelegationReady ? <EditEdgeSdLanMsp /> : <EditEdgeSdLanRec />
}