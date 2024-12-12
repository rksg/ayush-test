import { useState } from 'react'

import { Col, Form, Row, Space, Switch } from 'antd'
import { useIntl }                       from 'react-intl'

import { Loader, StepsForm, Tooltip } from '@acx-ui/components'
import { Features }                   from '@acx-ui/feature-toggle'
import {
  ApCompatibilityToolTip,
  EdgeCompatibilityDrawer,
  EdgeCompatibilityType,
  EdgeDhcpSelectionForm,
  useEdgeDhcpActions,
  useEdgeMdnsActions,
  useIsEdgeFeatureReady
} from '@acx-ui/rc/components'
import {
  useActivateHqosOnEdgeClusterMutation,
  useDeactivateHqosOnEdgeClusterMutation,
  useGetDhcpStatsQuery,
  useGetEdgeHqosProfileViewDataListQuery,
  useUpdateEdgeClusterArpTerminationSettingsMutation
} from '@acx-ui/rc/services'
import { ClusterArpTerminationSettings, EdgeClusterStatus, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                     from '@acx-ui/react-router-dom'
import { EdgeScopes }                                                                from '@acx-ui/types'
import { hasCrossVenuesPermission, hasPermission }                                   from '@acx-ui/user'

import EdgeQosProfileSelectionForm from '../../../../Policies/HqosBandwidth/Edge/HqosBandwidthSelectionForm'

import { ArpTerminationFormItem } from './ArpTermination'
import { MdnsProxyFormItem }      from './mDNS'


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
  const [edgeFeatureName, setEdgeFeatureName] = useState<IncompatibilityFeatures | undefined>()

  const { activateEdgeDhcp, deactivateEdgeDhcp } = useEdgeDhcpActions()
  const [activateEdgeQos] = useActivateHqosOnEdgeClusterMutation()
  const [deactivateEdgeQos] = useDeactivateHqosOnEdgeClusterMutation()
  const { activateEdgeMdnsCluster, deactivateEdgeMdnsCluster } = useEdgeMdnsActions()
  const [updateEdgeArpTermination] = useUpdateEdgeClusterArpTerminationSettingsMutation()


  const edgeCpuCores = currentClusterStatus?.edgeList?.map(e => e.cpuCores)[0]
  const hqosReadOnly = (edgeCpuCores===undefined || edgeCpuCores < 4) ? true : false
  const hqosReadOnlyToolTipMessage = hqosReadOnly === true ? $t({ defaultMessage:
    'Insufficient CPU cores have been detected on this cluster' }) : ''

  const { currentDhcp, isDhcpLoading } = useGetDhcpStatsQuery({
    payload: {
      fields: [
        'id'
      ],
      filters: { edgeClusterIds: [clusterId] }
    }
  },
  {
    skip: !Boolean(clusterId),
    selectFromResult: ({ data, isLoading }) => ({
      currentDhcp: data?.data[0],
      isDhcpLoading: isLoading
    })
  })

  const { currentHqos, isHqosLoading } = useGetEdgeHqosProfileViewDataListQuery({
    payload: {
      fields: [
        'id'
      ],
      filters: { edgeClusterIds: [clusterId] }
    }
  },
  {
    skip: !Boolean(clusterId),
    selectFromResult: ({ data, isLoading }) => ({
      currentHqos: data?.data[0],
      isHqosLoading: isLoading
    })
  })

  const handleApply = async () => {
    await handleApplyDhcp()
    await handleApplyQos()
    await handleApplyMdns()
    await handleApplyArpTermination()
  }

  const handleApplyDhcp = async () => {
    const isDhcpServiceActive = form.getFieldValue('dhcpSwitch')
    const currentDhcpId = currentDhcp?.id??''
    if (!isDhcpServiceActive) {
      if(currentDhcpId!== ''){
        await removeDhcpService()
      }
      return
    } else {
      const selectedDhcpId = form.getFieldValue('dhcpId') || ''
      if(selectedDhcpId === currentDhcpId) {
        return
      }
      await applyDhcpService(selectedDhcpId)
    }
  }

  const handleApplyQos = async () => {
    const isQosProfileActive = form.getFieldValue('hqosSwitch')
    const currentHqosId = currentHqos?.id??''
    if (!isQosProfileActive) {
      if(currentHqosId!== ''){
        await removeQosProfile()
      }
      return
    } else {
      const selectedHqosId = form.getFieldValue('hqosId') || ''
      if(selectedHqosId === currentHqosId) {
        return
      }
      await applyQosProfile(selectedHqosId)
    }
  }

  const handleApplyMdns = async () => {
    const isEdgeMdnsActive = form.getFieldValue('edgeMdnsSwitch')
    const originMdnsId = form.getFieldValue('originEdgeMdnsId')
    const selectedMdnsId = form.getFieldValue('edgeMdnsId')

    if (!clusterId || !currentClusterStatus?.venueId || (!originMdnsId && !selectedMdnsId)) return

    if (!isEdgeMdnsActive) {
      if (originMdnsId) {
        await deactivateEdgeMdnsCluster(
          originMdnsId,
          currentClusterStatus?.venueId,
          clusterId
        )
      }

      return
    } else {
      if (selectedMdnsId === originMdnsId)
        return

      await activateEdgeMdnsCluster(
        selectedMdnsId,
        currentClusterStatus?.venueId,
        clusterId
      )
    }
  }

  const handleApplyArpTermination = async () => {
    const originalArpSettings = form.getFieldValue('originalArpSettings')

    const currentArpSettings: ClusterArpTerminationSettings = {
      enabled: form.getFieldValue('arpTerminationSwitch'),
      agingTimerEnabled: form.getFieldValue('arpAgingTimerSwitch'),
      agingTimeSec: form.getFieldValue('agingTimeSec')
    }

    const needUpdate =
      originalArpSettings.enabled !== currentArpSettings.enabled ||
      originalArpSettings.agingTimerEnabled !== currentArpSettings.agingTimerEnabled ||
      originalArpSettings.agingTimeSec !== currentArpSettings.agingTimeSec

    if (needUpdate) {
      if (!currentArpSettings.enabled) {
        currentArpSettings.agingTimerEnabled = originalArpSettings.agingTimerEnabled
        currentArpSettings.agingTimeSec = originalArpSettings.agingTimeSec
      } else if (!currentArpSettings.agingTimerEnabled) {
        currentArpSettings.agingTimeSec = originalArpSettings.agingTimeSec
      }
    }

    if (needUpdate) {
      if (!clusterId || !currentClusterStatus?.venueId) return
      const requestPayload = {
        params: {
          venueId: currentClusterStatus?.venueId,
          edgeClusterId: clusterId
        },
        payload: currentArpSettings
      }
      await updateEdgeArpTermination(requestPayload).unwrap()
    }
  }

  const applyDhcpService = async (dhcpId: string) => {
    try {
      await activateEdgeDhcp(
        dhcpId,
        currentClusterStatus?.venueId ?? '',
        clusterId ?? ''
      )
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const removeDhcpService = async () => {
    try {
      await deactivateEdgeDhcp(
        currentDhcp?.id??'',
        currentClusterStatus?.venueId ?? '',
        clusterId ?? ''
      )
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const applyQosProfile = async (hqosId: string) => {
    try {
      await activateEdgeQos({ params: {
        policyId: hqosId,
        venueId: currentClusterStatus?.venueId,
        edgeClusterId: clusterId
      } }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const removeQosProfile = async () => {
    try {
      await deactivateEdgeQos({ params: {
        policyId: currentHqos?.id,
        venueId: currentClusterStatus?.venueId,
        edgeClusterId: clusterId
      } }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const hasUpdatePermission =!!hasCrossVenuesPermission({ needGlobalPermission: true })
  && hasPermission({ scopes: [EdgeScopes.UPDATE] })

  return (
    <Loader states={[{ isLoading: isHqosLoading || isDhcpLoading }]}>
      <StepsForm
        form={form}
        onFinish={handleApply}
        onCancel={() => navigate(linkToEdgeList)}
        buttonLabel={{ submit: hasUpdatePermission ? $t({ defaultMessage: 'Apply' }) : '' }}
        initialValues={{
          dhcpSwitch: Boolean(currentDhcp), dhcpId: currentDhcp?.id,
          hqosSwitch: Boolean(currentHqos), hqosId: currentHqos?.id
        }}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={7}>
              {
                isEdgeDhcpHaReady &&
                <StepsForm.FieldLabel width='50%'>
                  <Space>
                    {$t({ defaultMessage: 'DHCP Service' })}
                    <ApCompatibilityToolTip
                      title=''
                      visible
                      onClick={() => setEdgeFeatureName(IncompatibilityFeatures.DHCP)}
                    />
                  </Space>
                  <Form.Item
                    name='dhcpSwitch'
                    valuePropName='checked'
                    children={<Switch />}
                  />
                </StepsForm.FieldLabel>
              }
              {
                isEdgeDhcpHaReady &&
                <Form.Item
                  dependencies={['dhcpSwitch']}
                >
                  {
                    ({ getFieldValue }) => {
                      return getFieldValue('dhcpSwitch') && <EdgeDhcpSelectionForm hasPin={false} />
                    }
                  }
                </Form.Item>
              }
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={7}>
              {
                isEdgeHqosEnabled &&
                <StepsForm.FieldLabel width='50%'>
                  <Space>
                    {$t({ defaultMessage: 'Hierarchical QoS' })}
                    {
                      isEdgeCompatibilityEnabled &&
                      <ApCompatibilityToolTip
                        title=''
                        visible
                        onClick={() => setEdgeFeatureName(IncompatibilityFeatures.HQOS)}
                      />
                    }
                  </Space>
                  <Space>
                    <Tooltip title={hqosReadOnlyToolTipMessage}>
                      <Form.Item
                        name='hqosSwitch'
                        valuePropName='checked'
                      >
                        <Switch disabled={hqosReadOnly} />
                      </Form.Item>
                    </Tooltip>
                  </Space>

                </StepsForm.FieldLabel>
              }
              {
                isEdgeHqosEnabled &&
                <Form.Item
                  dependencies={['hqosSwitch']}
                >
                  {({ getFieldValue }) => {
                    return getFieldValue('hqosSwitch') && <EdgeQosProfileSelectionForm />
                  }}
                </Form.Item>
              }
            </Col>
          </Row>

          {isEdgeMdnsReady && <MdnsProxyFormItem
            venueId={currentClusterStatus?.venueId}
            clusterId={clusterId}
            setEdgeFeatureName={setEdgeFeatureName}
          />}

          {isEdgeArptReady && currentClusterStatus && <ArpTerminationFormItem
            currentClusterStatus={currentClusterStatus}
            setEdgeFeatureName={setEdgeFeatureName}
          />}

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
    </Loader>
  )
}
