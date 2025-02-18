import { useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { StepsForm }       from '@acx-ui/components'
import { EdgePermissions } from '@acx-ui/edge/components'
import { Features }        from '@acx-ui/feature-toggle'
import {
  EdgeCompatibilityDrawer,
  EdgeCompatibilityType,
  useIsEdgeFeatureReady
} from '@acx-ui/rc/components'
import { EdgeClusterStatus, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }      from '@acx-ui/react-router-dom'
import { EdgeScopes }                                 from '@acx-ui/types'
import { hasCrossVenuesPermission, hasPermission }    from '@acx-ui/user'

import { ArpTerminationFormItem, useHandleApplyArpTermination } from './ArpTermination'
import { DhcpFormItem, useHandleApplyDhcp }                     from './DHCP'
import { HQoSBandwidthFormItem, useHandleApplyHqos }            from './HQoSBandwidth'
import { MdnsProxyFormItem, useHandleApplyMdns }                from './mDNS'

interface EdgeNetworkControlProps {
  currentClusterStatus?: EdgeClusterStatus
}

export const EdgeNetworkControl = (props: EdgeNetworkControlProps) => {
  const { $t } = useIntl()
  const isEdgeDhcpHaReady = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE)
  const isEdgeHqosEnabled = useIsEdgeFeatureReady(Features.EDGE_QOS_TOGGLE)
  const isEdgeCompatibilityEnabled = useIsEdgeFeatureReady(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)
  const isEdgeMdnsReady = useIsEdgeFeatureReady(Features.EDGE_MDNS_PROXY_TOGGLE)
  const isEdgeArptReady = useIsEdgeFeatureReady(Features.EDGE_ARPT_TOGGLE)

  const { currentClusterStatus } = props
  const navigate = useNavigate()
  const params = useParams()
  const { clusterId } = params
  const linkToEdgeList = useTenantLink('/devices/edge')
  const [form] = Form.useForm()
  const [edgeFeatureName, setEdgeFeatureName] = useState<IncompatibilityFeatures>()

  const handleApplyDhcp = useHandleApplyDhcp(
    form,
    currentClusterStatus?.venueId,
    clusterId
  )

  const handleApplyHqos = useHandleApplyHqos(
    form,
    currentClusterStatus?.venueId,
    clusterId
  )
  const handleApplyMdns = useHandleApplyMdns(
    form,
    currentClusterStatus?.venueId,
    clusterId
  )
  const handleApplyArpTermination = useHandleApplyArpTermination(
    form,
    currentClusterStatus?.venueId,
    clusterId
  )

  const handleApply = async () => {
    await handleApplyDhcp()
    await handleApplyHqos()
    await handleApplyMdns()
    await handleApplyArpTermination()
  }

  const hasUpdatePermission =!!hasCrossVenuesPermission({ needGlobalPermission: true })
  && hasPermission({
    scopes: [EdgeScopes.UPDATE],
    rbacOpsIds: EdgePermissions.editEdgeClusterNetworkControl
  })

  return (
    <>
      <StepsForm
        form={form}
        onFinish={handleApply}
        onCancel={() => navigate(linkToEdgeList)}
        buttonLabel={{ submit: hasUpdatePermission ? $t({ defaultMessage: 'Apply' }) : '' }}
      >
        <StepsForm.StepForm>
          {
            isEdgeDhcpHaReady && currentClusterStatus &&
            <DhcpFormItem
              currentClusterStatus={currentClusterStatus}
              setEdgeFeatureName={setEdgeFeatureName}
            />
          }
          {
            isEdgeHqosEnabled && currentClusterStatus &&
            <HQoSBandwidthFormItem
              currentClusterStatus={currentClusterStatus}
              setEdgeFeatureName={setEdgeFeatureName}
            />
          }
          {
            isEdgeMdnsReady && currentClusterStatus &&
            <MdnsProxyFormItem
              venueId={currentClusterStatus?.venueId}
              clusterId={clusterId}
              setEdgeFeatureName={setEdgeFeatureName}
            />
          }
          {
            isEdgeArptReady && currentClusterStatus &&
            <ArpTerminationFormItem
              currentClusterStatus={currentClusterStatus}
              setEdgeFeatureName={setEdgeFeatureName}
            />
          }
        </StepsForm.StepForm>
      </StepsForm>
      {
        isEdgeCompatibilityEnabled &&
        <EdgeCompatibilityDrawer
          visible={!!edgeFeatureName}
          type={EdgeCompatibilityType.ALONE}
          title={$t({ defaultMessage: 'Compatibility Requirement' })}
          featureName={edgeFeatureName}
          onClose={() => setEdgeFeatureName(undefined)}
        />
      }
    </>
  )
}
