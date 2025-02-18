import { useEffect } from 'react'

import { Col, Form, FormInstance, Row, Space, Switch } from 'antd'
import { useIntl }                                     from 'react-intl'

import { getTitleWithBetaIndicator, Loader, StepsForm, Tooltip, useStepFormContext }                                            from '@acx-ui/components'
import { EdgePermissions }                                                                                                      from '@acx-ui/edge/components'
import { TierFeatures, useIsBetaEnabled }                                                                                       from '@acx-ui/feature-toggle'
import { ApCompatibilityToolTip }                                                                                               from '@acx-ui/rc/components'
import { useActivateHqosOnEdgeClusterMutation, useDeactivateHqosOnEdgeClusterMutation, useGetEdgeHqosProfileViewDataListQuery } from '@acx-ui/rc/services'
import { EdgeClusterStatus, IncompatibilityFeatures }                                                                           from '@acx-ui/rc/utils'
import { hasPermission }                                                                                                        from '@acx-ui/user'

import { EdgeHqosProfileSelectionForm } from '../../../../../Policies/HqosBandwidth/Edge/HqosBandwidthSelectionForm'

export const HQoSBandwidthFormItem = (props: {
  currentClusterStatus: EdgeClusterStatus,
  setEdgeFeatureName: (feature: IncompatibilityFeatures) => void
}) => {
  const { currentClusterStatus, setEdgeFeatureName } = props
  const { $t } = useIntl()
  const { form } = useStepFormContext()

  const { currentHqosId, isHqosLoading } = useGetEdgeHqosProfileViewDataListQuery({
    payload: {
      fields: [
        'id'
      ],
      filters: { edgeClusterIds: [currentClusterStatus.clusterId] }
    }
  },
  {
    skip: !Boolean(currentClusterStatus.clusterId),
    selectFromResult: ({ data, isLoading }) => ({
      currentHqosId: data?.data?.[0]?.id,
      isHqosLoading: isLoading
    })
  })

  useEffect(() => {
    form.setFieldValue('originHqosId', currentHqosId)
    form.setFieldsValue({
      hqosSwitch: Boolean(currentHqosId),
      hqosId: currentHqosId
    })
  }, [currentHqosId])

  const edgeCpuCores = currentClusterStatus?.edgeList?.[0].cpuCores
  const hqosReadOnly = (edgeCpuCores ?? 0) < 4
  const hqosReadOnlyToolTipMessage = hqosReadOnly ? $t({
    defaultMessage: 'Insufficient CPU cores have been detected on this cluster'
  }) : ''

  const hasUpdatePermission = hasPermission({ rbacOpsIds: EdgePermissions.switchEdgeClusterHqos })

  return (
    <>
      <Row gutter={20}>
        <Col flex='250px'>
          <Loader states={[{ isLoading: isHqosLoading }]}>
            <StepsForm.FieldLabel width='90%'>
              <Space>
                {$t({ defaultMessage: 'Hierarchical QoS' })}
                { useIsBetaEnabled(TierFeatures.EDGE_HQOS) ? getTitleWithBetaIndicator('') : null }
                <ApCompatibilityToolTip
                  title=''
                  showDetailButton
                  onClick={() => setEdgeFeatureName(IncompatibilityFeatures.HQOS)}
                />
              </Space>
              <Space>
                <Tooltip title={hqosReadOnlyToolTipMessage}>
                  <Form.Item
                    name='hqosSwitch'
                    valuePropName='checked'
                  >
                    <Switch disabled={hqosReadOnly || !hasUpdatePermission}/>
                  </Form.Item>
                </Tooltip>
              </Space>
            </StepsForm.FieldLabel>
          </Loader>
        </Col>
      </Row>
      <Row gutter={20}>
        <Col>
          <Form.Item
            dependencies={['hqosSwitch']}
          >
            {({ getFieldValue }) => {
              return getFieldValue('hqosSwitch') && <EdgeHqosProfileSelectionForm />
            }}
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}

export const useHandleApplyHqos = (form: FormInstance, venueId?: string, clusterId?: string) => {
  const [activateEdgeHqos] = useActivateHqosOnEdgeClusterMutation()
  const [deactivateEdgeHqos] = useDeactivateHqosOnEdgeClusterMutation()

  const handleApplyHqos = async () => {
    const isHqosProfileActive = form.getFieldValue('hqosSwitch')
    const originHqosId = form.getFieldValue('originHqosId')
    const selectedHqosId = form.getFieldValue('hqosId')

    if (!clusterId || !venueId || (!originHqosId && !selectedHqosId)) return

    if (!isHqosProfileActive) {
      if(originHqosId){
        await removeHqosProfile(
          originHqosId,
          venueId,
          clusterId
        )
      }
      return
    } else {
      if(selectedHqosId === originHqosId) {
        return
      }
      await applyHqosProfile(
        selectedHqosId,
        venueId,
        clusterId
      )
    }
  }

  const applyHqosProfile = async (hqosId: string, venueId: string, clusterId: string) => {
    try {
      await activateEdgeHqos({ params: {
        policyId: hqosId,
        venueId,
        edgeClusterId: clusterId
      } }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const removeHqosProfile = async (hqosId: string, venueId: string, clusterId: string) => {
    try {
      await deactivateEdgeHqos({ params: {
        policyId: hqosId,
        venueId,
        edgeClusterId: clusterId
      } }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return handleApplyHqos
}