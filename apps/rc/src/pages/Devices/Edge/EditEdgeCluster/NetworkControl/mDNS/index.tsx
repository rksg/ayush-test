import { useEffect } from 'react'

import { Col, Form, Row, Space, Switch } from 'antd'
import { useIntl }                       from 'react-intl'

import { Loader, StepsForm, useStepFormContext } from '@acx-ui/components'
import { ApCompatibilityToolTip }                from '@acx-ui/rc/components'
import { useGetEdgeMdnsProxyViewDataListQuery }  from '@acx-ui/rc/services'
import { IncompatibilityFeatures }               from '@acx-ui/rc/utils'

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

  return <>
    <Row gutter={20}>
      <Col flex='250px'>
        <Loader states={[{ isLoading: isMdnsLoading }]}>
          <StepsForm.FieldLabel width='90%'>
            <Space>
              {$t({ defaultMessage: 'mDNS Proxy' })}
              <ApCompatibilityToolTip
                title=''
                visible
                onClick={() => setEdgeFeatureName(IncompatibilityFeatures.EDGE_MDNS_PROXY)}
              />
            </Space>
            <Space>
              <Form.Item
                name='edgeMdnsSwitch'
                valuePropName='checked'
              >
                <Switch />
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