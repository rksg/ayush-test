import { useEffect, useState } from 'react'

import { Col, Form, Row, Switch } from 'antd'
import { useIntl }                from 'react-intl'


import { Loader, StepsForm }                                                                                                                       from '@acx-ui/components'
import { Features }                                                                                                                                from '@acx-ui/feature-toggle'
import { EdgeDhcpSelectionForm, useEdgeDhcpActions, useIsEdgeFeatureReady }                                                                        from '@acx-ui/rc/components'
import { useActivateQosOnEdgeClusterMutation, useDeactivateQosOnEdgeClusterMutation, useGetDhcpStatsQuery, useGetEdgeQosProfileViewDataListQuery } from '@acx-ui/rc/services'
import { EdgeClusterStatus }                                                                                                                       from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                                                                                   from '@acx-ui/react-router-dom'

import EdgeQosProfileSelectionForm from '../../../../Policies/QosBandwidth/Edge/QosBandwidthSelectionForm'

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
  const isEdgeQosEnabled = useIsEdgeFeatureReady(Features.EDGE_QOS_TOGGLE)

  const [currentDhcpId, setCurrentDhcpId] = useState('')
  const [currentQosId, setCurrentQosId] = useState('')
  const { activateEdgeDhcp, deactivateEdgeDhcp } = useEdgeDhcpActions()
  const [activateEdgeQos] = useActivateQosOnEdgeClusterMutation()
  const [deactivateEdgeQos] = useDeactivateQosOnEdgeClusterMutation()
  const { $t } = useIntl()

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

  const { currentQos, isQosLoading } = useGetEdgeQosProfileViewDataListQuery({
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

  useEffect(() => {
    if (currentDhcp) {
      setCurrentDhcpId(currentDhcp.id)
    }
  }, [currentDhcp])

  useEffect(() => {
    if (currentQos) {
      setCurrentQosId(currentQos.id??'')
    }
  }, [currentQos])

  const handleApply = async () => {
    await handleApplyDhcp()
    await handleApplyQos()
  }

  const handleApplyDhcp = async () => {
    const isDhcpServiceActive = form.getFieldValue('dhcpSwitch')
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
      setCurrentDhcpId(dhcpId)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const removeDhcpService = async () => {
    try {
      await deactivateEdgeDhcp(
        currentDhcpId,
        currentClusterStatus?.venueId ?? '',
        clusterId ?? ''
      )
      setCurrentDhcpId('')
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
      setCurrentQosId(qosId)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const removeQosProfile = async () => {
    try {
      await deactivateEdgeQos({ params: {
        policyId: currentQosId,
        venueId: currentClusterStatus?.venueId,
        edgeClusterId: clusterId
      } }).unwrap()
      setCurrentQosId('')
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
              {isEdgeQosEnabled &&
              <StepsForm.FieldLabel width='50%'>
                {$t({ defaultMessage: 'Hierarchical QoS' })}
                <Form.Item
                  name='qosSwitch'
                  valuePropName='checked'
                  children={<Switch />}
                />
              </StepsForm.FieldLabel>
              }
              {
                isEdgeQosEnabled &&
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
