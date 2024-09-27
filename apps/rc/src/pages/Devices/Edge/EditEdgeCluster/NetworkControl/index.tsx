
import { Col, Form, Row, Space, Switch } from 'antd'
import { useIntl }                       from 'react-intl'


import { Loader, StepsForm, Tooltip }                                                                                                                 from '@acx-ui/components'
import { Features }                                                                                                                                   from '@acx-ui/feature-toggle'
import { EdgeDhcpSelectionForm, useEdgeDhcpActions, useIsEdgeFeatureReady }                                                                           from '@acx-ui/rc/components'
import { useActivateHqosOnEdgeClusterMutation, useDeactivateHqosOnEdgeClusterMutation, useGetDhcpStatsQuery, useGetEdgeHqosProfileViewDataListQuery } from '@acx-ui/rc/services'
import { EdgeClusterStatus }                                                                                                                          from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                                                                                      from '@acx-ui/react-router-dom'

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

  const isEdgeDhcpHaReady = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE)
  const isEdgeHqosEnabled = useIsEdgeFeatureReady(Features.EDGE_QOS_TOGGLE)

  const { activateEdgeDhcp, deactivateEdgeDhcp } = useEdgeDhcpActions()
  const [activateEdgeQos] = useActivateHqosOnEdgeClusterMutation()
  const [deactivateEdgeQos] = useDeactivateHqosOnEdgeClusterMutation()
  const { $t } = useIntl()

  const edgeCpuCores = currentClusterStatus?.edgeList?.map(e => e.cpuCores)[0]
  const hqosReadOnly = (edgeCpuCores===undefined || edgeCpuCores < 4) ? true : false

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

  const { currentQos, isQosLoading } = useGetEdgeHqosProfileViewDataListQuery({
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
      currentQos: data?.data[0],
      isQosLoading: isLoading
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
    const isQosProfileActive = form.getFieldValue('qosSwitch')
    const currentQosId = currentQos?.id??''
    if (!isQosProfileActive) {
      if(currentQosId!== ''){
        await removeQosProfile()
      }
      return
    } else {
      const selectedQosId = form.getFieldValue('qosId') || ''
      if(selectedQosId === currentQosId) {
        return
      }
      await applyQosProfile(selectedQosId)
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

  const applyQosProfile = async (qosId: string) => {
    try {
      await activateEdgeQos({ params: {
        policyId: qosId,
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
        policyId: currentQos?.id,
        venueId: currentClusterStatus?.venueId,
        edgeClusterId: clusterId
      } }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <Loader states={[{ isLoading: isQosLoading || isDhcpLoading }]}>
      <StepsForm
        editMode
        form={form}
        onFinish={handleApply}
        onCancel={() => navigate(linkToEdgeList)}
        initialValues={{
          dhcpSwitch: Boolean(currentDhcp), dhcpId: currentDhcp?.id,
          qosSwitch: Boolean(currentQos), qosId: currentQos?.id }}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={7}>
              {isEdgeDhcpHaReady &&
            <StepsForm.FieldLabel width='50%'>
              {$t({ defaultMessage: 'DHCP Service' })}
              <Form.Item
                name='dhcpSwitch'
                valuePropName='checked'
                children={
                  <Switch />
                }
              />
            </StepsForm.FieldLabel>
              }
              {isEdgeDhcpHaReady &&
            <Form.Item
              dependencies={['dhcpSwitch']}
            >
              {({ getFieldValue }) => {
                return getFieldValue('dhcpSwitch') ?<EdgeDhcpSelectionForm hasNsg={false} />:<></>
              }}
            </Form.Item>}
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={7}>
              {isEdgeHqosEnabled &&
              <StepsForm.FieldLabel width='50%'>
                {$t({ defaultMessage: 'Hierarchical QoS' })}
                <Space>
                  <Form.Item noStyle
                    name='qosSwitch'
                    valuePropName='checked'
                  >
                    <Switch disabled={hqosReadOnly} />
                  </Form.Item>
                  {hqosReadOnly && <Tooltip.Question
                    title={
                      $t({ defaultMessage: `
                                Insufficient CPU cores have been detected on this cluster` })
                    }
                    placement='right'
                    iconStyle={{ width: 16, height: 16, marginTop: 4 }}
                  />}
                </Space>
              </StepsForm.FieldLabel>
              }
              {
                isEdgeHqosEnabled &&
                <Form.Item
                  dependencies={['qosSwitch']}
                >
                  {({ getFieldValue }) => {
                    return getFieldValue('qosSwitch') ?<EdgeQosProfileSelectionForm />:<></>
                  }}
                </Form.Item>
              }
            </Col>
          </Row>
        </StepsForm.StepForm>

      </StepsForm>
    </Loader>
  )
}
