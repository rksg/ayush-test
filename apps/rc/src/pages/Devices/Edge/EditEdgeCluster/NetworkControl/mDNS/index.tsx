import { useEffect } from 'react'

import { Col, Form, FormInstance, Row, Space, Switch } from 'antd'
import { useIntl }                                     from 'react-intl'

import { getTitleWithBetaIndicator, Loader, StepsForm, useStepFormContext } from '@acx-ui/components'
import { EdgePermissions }                                                  from '@acx-ui/edge/components'
import { TierFeatures, useIsBetaEnabled }                                   from '@acx-ui/feature-toggle'
import { ApCompatibilityToolTip, useEdgeMdnsActions }                       from '@acx-ui/rc/components'
import { useGetEdgeMdnsProxyViewDataListQuery }                             from '@acx-ui/rc/services'
import { IncompatibilityFeatures }                                          from '@acx-ui/rc/utils'
import { hasPermission }                                                    from '@acx-ui/user'

import EdgeMdnsProfileSelectionForm from './EdgeMdnsProfileSelectionForm'

export const MdnsProxyFormItem = (props: {
  clusterId: string | undefined,
  venueId: string | undefined,
  setEdgeFeatureName: (feature: IncompatibilityFeatures) => void
}) => {
  const { $t } = useIntl()
  const { clusterId, venueId, setEdgeFeatureName } = props
  const { form } = useStepFormContext()

  const { currentEdgeMdns, isMdnsLoading } = useGetEdgeMdnsProxyViewDataListQuery({
    payload: {
      fields: [
        'id', 'activations'
      ],
      matchFields: [{
        field: 'edgeClusters.clusterId',
        value: clusterId
      }]
    }
  },
  {
    skip: !Boolean(venueId),
    selectFromResult: ({ data, isLoading }) => ({
      currentEdgeMdns: data?.data[0],
      isMdnsLoading: isLoading
    })
  })

  useEffect(() => {
    form.setFieldValue('originEdgeMdnsId', currentEdgeMdns?.id)
    form.setFieldsValue({
      edgeMdnsSwitch: Boolean(currentEdgeMdns),
      edgeMdnsId: currentEdgeMdns?.id
    })
  }, [currentEdgeMdns])

  const hasUpdatePermission = hasPermission({ rbacOpsIds: EdgePermissions.switchEdgeClusterMdns })

  return <>
    <Row gutter={20}>
      <Col flex='250px'>
        <Loader states={[{ isLoading: isMdnsLoading }]}>
          <StepsForm.FieldLabel width='90%'>
            <Space>
              {$t({ defaultMessage: 'mDNS Proxy' })}
              { useIsBetaEnabled(TierFeatures.EDGE_MDNS_PROXY)
                ? getTitleWithBetaIndicator('') : null }
              <ApCompatibilityToolTip
                title=''
                showDetailButton
                onClick={() => setEdgeFeatureName(IncompatibilityFeatures.EDGE_MDNS_PROXY)}
              />
            </Space>
            <Space>
              <Form.Item
                name='edgeMdnsSwitch'
                valuePropName='checked'
              >
                <Switch disabled={!hasUpdatePermission}/>
              </Form.Item>
            </Space>
          </StepsForm.FieldLabel>
        </Loader>
      </Col>
    </Row>
    <Row gutter={20}>
      <Col>
        <Form.Item dependencies={['edgeMdnsSwitch']}>
          {({ getFieldValue }) => {
            return getFieldValue('edgeMdnsSwitch') && <EdgeMdnsProfileSelectionForm />
          }}
        </Form.Item>
      </Col>
    </Row>
  </>
}

export const useHandleApplyMdns = (form: FormInstance, venueId?: string, clusterId?: string) => {
  const { activateEdgeMdnsCluster, deactivateEdgeMdnsCluster } = useEdgeMdnsActions()

  const handleApplyMdns = async () => {
    const isEdgeMdnsActive = form.getFieldValue('edgeMdnsSwitch')
    const originMdnsId = form.getFieldValue('originEdgeMdnsId')
    const selectedMdnsId = form.getFieldValue('edgeMdnsId')

    if (!clusterId || !venueId || (!originMdnsId && !selectedMdnsId)) return

    if (!isEdgeMdnsActive) {
      if (originMdnsId) {
        await deactivateEdgeMdnsCluster(
          originMdnsId,
          venueId,
          clusterId
        )
      }
      return
    } else {
      if (selectedMdnsId === originMdnsId){
        return
      }
      await activateEdgeMdnsCluster(
        selectedMdnsId,
        venueId,
        clusterId
      )
    }
  }

  return handleApplyMdns
}