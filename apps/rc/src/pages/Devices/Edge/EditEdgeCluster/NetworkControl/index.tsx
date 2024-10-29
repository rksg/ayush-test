import { useState } from 'react'

import { Col, Form, Row, Space, Switch } from 'antd'
import { useIntl }                       from 'react-intl'

import { Loader, StepsForm, Tooltip }                                                                                                                 from '@acx-ui/components'
import { Features }                                                                                                                                   from '@acx-ui/feature-toggle'
import { ApCompatibilityToolTip, EdgeCompatibilityDrawer, EdgeCompatibilityType, EdgeDhcpSelectionForm, useEdgeDhcpActions, useIsEdgeFeatureReady }   from '@acx-ui/rc/components'
import { useActivateHqosOnEdgeClusterMutation, useDeactivateHqosOnEdgeClusterMutation, useGetDhcpStatsQuery, useGetEdgeHqosProfileViewDataListQuery } from '@acx-ui/rc/services'
import { EdgeClusterStatus, IncompatibilityFeatures }                                                                                                 from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                                                                                      from '@acx-ui/react-router-dom'
import { EdgeScopes }                                                                                                                                 from '@acx-ui/types'
import { hasCrossVenuesPermission, hasPermission }                                                                                                    from '@acx-ui/user'

import EdgeQosProfileSelectionForm from '../../../../Policies/HqosBandwidth/Edge/HqosBandwidthSelectionForm'


interface EdgeNetworkControlProps {
  currentClusterStatus?: EdgeClusterStatus
}

export const EdgeNetworkControl = (props: EdgeNetworkControlProps) => {
  const { currentClusterStatus } = props
  const navigate = useNavigate()
  const params = useParams()
  const { clusterId } = params
  const linkToEdgeList = useTenantLink('/devices/edge')
  const [form] = Form.useForm()
  const [edgeFeatureName, setEdgeFeatureName] = useState<IncompatibilityFeatures | undefined>()

  const isEdgeDhcpHaReady = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE)
  const isEdgeHqosEnabled = useIsEdgeFeatureReady(Features.EDGE_QOS_TOGGLE)
  const isEdgeCompatibilityEnabled = useIsEdgeFeatureReady(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)

  const { activateEdgeDhcp, deactivateEdgeDhcp } = useEdgeDhcpActions()
  const [activateEdgeQos] = useActivateHqosOnEdgeClusterMutation()
  const [deactivateEdgeQos] = useDeactivateHqosOnEdgeClusterMutation()
  const { $t } = useIntl()

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
                    {
                      isEdgeCompatibilityEnabled &&
                      <ApCompatibilityToolTip
                        title=''
                        visible
                        onClick={() => setEdgeFeatureName(IncompatibilityFeatures.DHCP)}
                      />
                    }
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
