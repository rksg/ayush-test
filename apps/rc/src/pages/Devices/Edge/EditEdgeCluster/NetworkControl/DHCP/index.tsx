import { useEffect } from 'react'

import { Col, Form, FormInstance, Row, Space, Switch } from 'antd'
import { useIntl }                                     from 'react-intl'

import { Loader, StepsForm, useStepFormContext }                                                    from '@acx-ui/components'
import { EdgePermissions }                                                                          from '@acx-ui/edge/components'
import { Features }                                                                                 from '@acx-ui/feature-toggle'
import { ApCompatibilityToolTip, EdgeDhcpSelectionForm, useEdgeDhcpActions, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import { useGetDhcpStatsQuery, useGetEdgeMvSdLanViewDataListQuery, useGetEdgePinViewDataListQuery } from '@acx-ui/rc/services'
import { EdgeClusterStatus, IncompatibilityFeatures }                                               from '@acx-ui/rc/utils'
import { hasPermission }                                                                            from '@acx-ui/user'

export const DhcpFormItem = (props: {
  currentClusterStatus: EdgeClusterStatus,
  setEdgeFeatureName: (feature: IncompatibilityFeatures) => void
}) => {
  const { currentClusterStatus, setEdgeFeatureName } = props
  const isEdgePinEnabled = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isMvEdgeSdLanEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)
  const { $t } = useIntl()
  const { form } = useStepFormContext()

  const { currentDhcpId, isDhcpLoading } = useGetDhcpStatsQuery({
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
      currentDhcpId: data?.data?.[0]?.id,
      isDhcpLoading: isLoading
    })
  })

  const { hasPin } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: ['id'],
      filters: { 'edgeClusterInfo.edgeClusterId': [currentClusterStatus.clusterId] }
    }
  }, {
    skip: !Boolean(currentClusterStatus.clusterId) || !isEdgePinEnabled,
    selectFromResult: ({ data }) => {
      return {
        hasPin: Boolean(data?.data?.[0]?.id)
      }
    }
  })

  const { hasSdlan } = useGetEdgeMvSdLanViewDataListQuery(
    {
      payload: {
        fields: ['id', 'edgeClusterId',
          'isGuestTunnelEnabled', 'guestEdgeClusterId'
        ],
        filters: {
          tenantId: [currentClusterStatus.tenantId]
        }
      }
    },
    {
      skip: !Boolean(currentClusterStatus.clusterId) || !isMvEdgeSdLanEnabled,
      selectFromResult: ({ data }) => {
        return {
          hasSdlan: data?.data.some(sdlan => {
            return sdlan.edgeClusterId === currentClusterStatus.clusterId
                 || (sdlan.isGuestTunnelEnabled &&
                  sdlan.guestEdgeClusterId === currentClusterStatus.clusterId)
          })
        }
      }
    }
  )

  useEffect(() => {
    form.setFieldValue('originDhcpId', currentDhcpId)
    form.setFieldsValue({
      dhcpSwitch: Boolean(currentDhcpId),
      dhcpId: currentDhcpId
    })
  }, [currentDhcpId])


  const hasUpdatePermission = hasPermission({ rbacOpsIds: EdgePermissions.switchEdgeClusterDhcp })

  return (
    <>
      <Row gutter={20}>
        <Col flex='250px'>
          <Loader states={[{ isLoading: isDhcpLoading }]}>
            <StepsForm.FieldLabel width='90%'>
              <Space>
                {$t({ defaultMessage: 'DHCP Service' })}
                <ApCompatibilityToolTip
                  title=''
                  showDetailButton
                  onClick={() => setEdgeFeatureName(IncompatibilityFeatures.DHCP)}
                />
              </Space>
              <Form.Item
                name='dhcpSwitch'
                valuePropName='checked'
                children={<Switch disabled={hasSdlan || hasPin || !hasUpdatePermission}/>}
              />
            </StepsForm.FieldLabel>
          </Loader>
        </Col>
      </Row>
      <Row gutter={20}>
        <Col>
          <Form.Item
            dependencies={['dhcpSwitch']}
          >
            {
              ({ getFieldValue }) => {
                // eslint-disable-next-line max-len
                return getFieldValue('dhcpSwitch') && <EdgeDhcpSelectionForm hasPin={hasPin} />
              }
            }
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}

export const useHandleApplyDhcp = (form: FormInstance, venueId?: string, clusterId?: string) => {
  const { activateEdgeDhcp, deactivateEdgeDhcp } = useEdgeDhcpActions()

  const handleApplyDhcp = async () => {
    const isDhcpServiceActive = form.getFieldValue('dhcpSwitch')
    const originDhcpId = form.getFieldValue('originDhcpId')
    const selectedDhcpId = form.getFieldValue('dhcpId')

    if (!clusterId || !venueId || (!originDhcpId && !selectedDhcpId)) return

    if (!isDhcpServiceActive) {
      if(originDhcpId){
        await removeDhcpService(
          originDhcpId,
          venueId,
          clusterId
        )
      }
      return
    } else {
      if(selectedDhcpId === originDhcpId) {
        return
      }
      await applyDhcpService(
        selectedDhcpId,
        venueId,
        clusterId
      )
    }
  }

  const applyDhcpService = async (dhcpId: string, venueId: string, clusterId: string) => {
    try {
      await activateEdgeDhcp(
        dhcpId,
        venueId,
        clusterId
      )
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const removeDhcpService = async (dhcpId: string, venueId: string, clusterId: string) => {
    try {
      await deactivateEdgeDhcp(
        dhcpId,
        venueId,
        clusterId
      )
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return handleApplyDhcp
}