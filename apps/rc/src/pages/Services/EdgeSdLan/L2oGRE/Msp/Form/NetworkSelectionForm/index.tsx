import { Col, Form, Row, Typography } from 'antd'
import { useIntl }                    from 'react-intl'

import { StepsForm, Tabs, useStepFormContext } from '@acx-ui/components'

import { EdgeSdLanVenueNetworksTable } from '../../../Form/NetworkSelectionForm/VenueNetworkTable'
import { DescriptionWrapper }          from '../../../styledComponents'
import { ApplyTo }                     from '../GeneralForm'

import { EdgeSdLanVenueNetworksTemplateTable } from './VenueTemplateNetworkTable'

export const NetworkSelectionForm = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext()
  const applyTo = form.getFieldValue('applyTo')
  const onlyMyAccount = applyTo.length === 1 && applyTo?.includes(ApplyTo.MY_ACCOUNT)
  const onlyMyCustomers = applyTo.length === 1 && applyTo?.includes(ApplyTo.MY_CUSTOMERS)

  return <>
    <Row>
      <Col span={24}>
        <StepsForm.Title>{$t({ defaultMessage: 'Wi-Fi Network Selection' })}</StepsForm.Title>
      </Col>
    </Row>
    {
      applyTo.length > 1 &&
      <Row>
        <Col span={24}>
          <DescriptionWrapper>
            <Typography.Text>
              {$t({
                defaultMessage: `Select <venuePlural></venuePlural> and networks for your account, 
              as well as <venueSingular></venueSingular> and network templates 
              for your customers — SD-LAN will be activated in all selected locations`
              })}
            </Typography.Text>
          </DescriptionWrapper>
        </Col>
      </Row>
    }
    {
      onlyMyAccount &&
      <Row >
        <Col span={24}>
          <Form.Item
            name='activatedNetworks'
          >
            <EdgeSdLanVenueNetworksTable />
          </Form.Item>
        </Col>
      </Row>
    }
    {
      onlyMyCustomers &&
      <Row >
        <Col span={24}>
          <Form.Item
            name='activatedNetworkTemplates'
          >
            <EdgeSdLanVenueNetworksTemplateTable />
          </Form.Item>
        </Col>
      </Row>
    }
    {
      applyTo.length > 1 &&
      <Row >
        <Col span={24}>
          <Tabs type='card'>
            {
              applyTo.includes(ApplyTo.MY_ACCOUNT) &&
              <Tabs.TabPane tab={$t({ defaultMessage: 'Own Account' })} key='myAccount'>
                <Form.Item
                  name='activatedNetworks'
                >
                  <EdgeSdLanVenueNetworksTable />
                </Form.Item>
              </Tabs.TabPane>
            }
            {
              applyTo.includes(ApplyTo.MY_CUSTOMERS) &&
              <Tabs.TabPane tab={$t({ defaultMessage: 'My Customers' })} key='myCustomers'>
                <Form.Item
                  name='activatedNetworkTemplates'
                >
                  <EdgeSdLanVenueNetworksTemplateTable />
                </Form.Item>
              </Tabs.TabPane>
            }
          </Tabs>
        </Col>
      </Row>
    }
  </>
}