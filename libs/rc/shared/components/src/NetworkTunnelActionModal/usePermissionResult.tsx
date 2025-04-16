import { Features, useIsSplitOn }                                                                                                                       from '@acx-ui/feature-toggle'
import { EdgeSdLanUrls, hasPolicyPermission, hasServicePermission, IpsecUrls, PolicyOperation, PolicyType, ServiceOperation, ServiceType, SoftGreUrls } from '@acx-ui/rc/utils'
import { hasPermission }                                                                                                                                from '@acx-ui/user'
import { getOpsApi }                                                                                                                                    from '@acx-ui/utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

export const usePermissionResult = () => {
  const isAllowOpsEnabled = useIsSplitOn(Features.RBAC_OPERATIONS_API_TOGGLE)
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
  const isIpSecEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)

  const getSdLanPermission = () => {
    return isAllowOpsEnabled ?
      hasPermission({
        rbacOpsIds: [
          [
            getOpsApi(EdgeSdLanUrls.activateEdgeMvSdLanNetwork),
            getOpsApi(EdgeSdLanUrls.deactivateEdgeMvSdLanNetwork)
          ]
        ]
      }):
      hasServicePermission({ type: ServiceType.EDGE_SD_LAN, oper: ServiceOperation.EDIT })
  }

  const getSoftGrePermission = () => {
    return isAllowOpsEnabled ?
      hasPermission({
        rbacOpsIds: [
          [
            getOpsApi(SoftGreUrls.activateSoftGre),
            getOpsApi(SoftGreUrls.dectivateSoftGre)
          ]
        ]
      }):
      hasPolicyPermission({ type: PolicyType.SOFTGRE, oper: PolicyOperation.EDIT })
  }

  const getIpSecPermission = () => {
    return isAllowOpsEnabled ?
      hasPermission({
        rbacOpsIds: [
          [
            getOpsApi(IpsecUrls.activateIpsec),
            getOpsApi(IpsecUrls.deactivateIpsec)
          ]
        ]
      }):
      hasPolicyPermission({ type: PolicyType.IPSEC, oper: PolicyOperation.EDIT })
  }

  // eslint-disable-next-line max-len
  const hasEdgeSdLanPermission = !isEdgeSdLanMvEnabled || getSdLanPermission()
  // eslint-disable-next-line max-len
  const hasSoftGrePermission = !isSoftGreEnabled || getSoftGrePermission()
  // eslint-disable-next-line max-len
  const hasIpSecPermission = !isIpSecEnabled || getIpSecPermission()

  return {
    hasPartialPermission: hasEdgeSdLanPermission || hasSoftGrePermission || hasIpSecPermission,
    hasAllPermission: hasEdgeSdLanPermission && hasSoftGrePermission && hasIpSecPermission,
    hasEdgeSdLanPermission,
    hasSoftGrePermission,
    hasIpSecPermission
  }
}