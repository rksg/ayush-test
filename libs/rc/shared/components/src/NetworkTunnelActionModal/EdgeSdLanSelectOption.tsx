
import { isNil } from 'lodash'

import { Features }       from '@acx-ui/feature-toggle'
import {
  EdgeMvSdLanViewData,
  NetworkTypeEnum,
  VLANPoolViewModelType
} from '@acx-ui/rc/utils'


import { useIsEdgeFeatureReady } from '../useEdgeActions'

import { EdgeSdLanSelectOptionContent }      from './EdgeSdLanSelectOptionContent'
import { EdgeSdLanSelectOptionL2greContent } from './EdgeSdLanSelectOptionL2greContent'
import { NetworkTunnelTypeEnum }             from './types'

interface SdLanSelectOptionProps {
  tunnelTypeInitVal: NetworkTunnelTypeEnum
  currentTunnelType: NetworkTunnelTypeEnum
  networkId: string
  networkVenueId: string
  networkType: NetworkTypeEnum
  venueSdLan: EdgeMvSdLanViewData | undefined
  networkVlanPool?: VLANPoolViewModelType
  disabledInfo?: {
    isDisabled: boolean
    tooltip: string | undefined
  }
}

export const EdgeSdLanSelectOption = (props: SdLanSelectOptionProps) => {

  const {
    networkId, networkVenueId, networkType,
    tunnelTypeInitVal, currentTunnelType,
    venueSdLan, networkVlanPool,
    disabledInfo
  } = props

  const hasVlanPool = !isNil(networkVlanPool)
  const isEdgeL2greReady = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)

  return !disabledInfo?.isDisabled ? (
    isEdgeL2greReady ? (
      <EdgeSdLanSelectOptionL2greContent
        venueSdLan={venueSdLan}
        networkType={networkType}
        hasVlanPool={hasVlanPool}
      />
    ) :
      (<EdgeSdLanSelectOptionContent
        networkId={networkId}
        networkVenueId={networkVenueId}
        venueSdLan={venueSdLan}
        networkType={networkType}
        currentTunnelType={currentTunnelType}
        hasVlanPool={hasVlanPool}
        tunnelTypeInitVal={tunnelTypeInitVal}
      />)) : <></>
}