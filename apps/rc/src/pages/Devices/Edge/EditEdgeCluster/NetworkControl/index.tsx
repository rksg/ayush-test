import { useEffect, useState } from 'react'

import { Col, Form, Row, Switch } from 'antd'
import { useIntl }                from 'react-intl'


import { StepsForm }                                                                                                                               from '@acx-ui/components'
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

  const [isDhcpServiceActive, setIsDhcpServiceActive] = useState(false)
  const [currentDhcpId, setCurrentDhcpId] = useState('')
  const [isQosProfileActive, setIsQosProfileActive] = useState(false)
  const [currentQosId, setCurrentQosId] = useState('')
  const { activateEdgeDhcp, deactivateEdgeDhcp } = useEdgeDhcpActions()
  const [activateEdgeQos] = useActivateQosOnEdgeClusterMutation()
  const [deactivateEdgeQos] = useDeactivateQosOnEdgeClusterMutation()
  const { $t } = useIntl()

  const { currentDhcp } = useGetDhcpStatsQuery({
    payload: {
      fields: [
        'id'
      ],
      filters: { edgeClusterIds: [clusterId] }
    }
  },
  {
    skip: !Boolean(clusterId),
    selectFromResult: ({ data }) => ({
      currentDhcp: data?.data[0]
    })
  })

  const { currentQos } = useGetEdgeQosProfileViewDataListQuery({
    payload: {
      fields: [
        'id'
      ],
      filters: { edgeClusterIds: [clusterId] }
    }
  },
  {
    skip: !Boolean(clusterId),
    selectFromResult: ({ data }) => ({
      currentQos: data?.data[0]
    })
  })

  useEffect(() => {
    setIsDhcpServiceActive(Boolean(currentDhcp))

    if (currentDhcp) {
      setCurrentDhcpId(currentDhcp.id)
      form.setFieldValue('dhcpId', currentDhcp.id)
    }
  }, [currentDhcp])

  useEffect(() => {
    setIsQosProfileActive(Boolean(currentQos))

    if (currentQos) {
      setCurrentQosId(currentQos.id??'')
      form.setFieldValue('qosId', currentQos.id)
    }
  }, [currentQos])

  const handleApply = async () => {
    handleApplyDhcp()
    handleApplyQos()
  }

  const handleApplyDhcp = async () => {
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
      activateEdgeQos({ params: {
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
      deactivateEdgeQos({ params: {
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
    <StepsForm
      editMode
      form={form}
      onFinish={handleApply}
      onCancel={() => navigate(linkToEdgeList)}
    >
      <StepsForm.StepForm>
        <Row gutter={20}>
          <Col span={7}>
            {isEdgeDhcpHaReady &&
            <StepsForm.FieldLabel width='50%'>
              {$t({ defaultMessage: 'DHCP Service' })}
              <Form.Item
                children={
                  <Switch checked={isDhcpServiceActive} onChange={setIsDhcpServiceActive} />
                }
              />
            </StepsForm.FieldLabel>
            }
            {isEdgeDhcpHaReady && isDhcpServiceActive &&
            <Form.Item>
              <EdgeDhcpSelectionForm hasNsg={false} />
            </Form.Item>}
          </Col>
        </Row>
        <Row gutter={20}>
          <Col span={7}>
            {isEdgeQosEnabled &&
              <StepsForm.FieldLabel width='50%'>
                {$t({ defaultMessage: 'Hierarchical QoS' })}
                <Form.Item
                  children={
                    <Switch checked={isQosProfileActive} onChange={setIsQosProfileActive} />
                  }
                />
              </StepsForm.FieldLabel>
            }
            {isEdgeQosEnabled && isQosProfileActive &&
            <Form.Item>
              <EdgeQosProfileSelectionForm />
            </Form.Item>}
          </Col>
        </Row>
      </StepsForm.StepForm>

    </StepsForm>
  )
}
