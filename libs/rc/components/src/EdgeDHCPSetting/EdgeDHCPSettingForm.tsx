import { Form, Input, Switch, Row, Col } from 'antd'
import { useIntl }                       from 'react-intl'

import { Subtitle, Alert, StepsForm } from '@acx-ui/components'

import DHCPHostTable from './DHCPHost'
import DHCPPoolTable from './DHCPPool'

const { useWatch } = Form

export const EdgeDHCPSettingForm = () => {

  const { $t } = useIntl()
  const [
    enableDhcpRelay
  ] = [
    useWatch<boolean>('enableDhcpRelay')
  ]

  return (
    <>
      <Row gutter={20}>
        <Col span={7}>
          <Subtitle level={3}>
            { $t({ defaultMessage: 'Settings' }) }
          </Subtitle>
          <Form.Item
            name='name'
            label={$t({ defaultMessage: 'Service Name' })}
            rules={[{
              required: true
            }]}
            children={<Input />}
          />
          <StepsForm.FieldLabel width='100px'>
            {$t({ defaultMessage: 'DHCP Relay:' })}
            <Form.Item
              name='enableDhcpRelay'
              valuePropName='checked'
              initialValue={false}
              children={<Switch />}
            />
          </StepsForm.FieldLabel>
          {enableDhcpRelay &&
            <>
              <Form.Item
                name='externalDhcpAddress'
                label={$t({ defaultMessage: 'FQDN Name or IP Address' })}
                rules={[{
                  required: true
                }]}
                children={<Input />}
              />
              <Alert message={
                $t({ defaultMessage: `If this DHCP service is going to be used for 
                Network Segmentation service, please make sure you set the DHCP pool for it.` })
              }
              type='info'
              showIcon />
            </>
          }
        </Col>
      </Row>

      <Subtitle level={3}>
        { $t({ defaultMessage: 'Set DHCP Pools' }) }
      </Subtitle>
      <Row gutter={20}>
        <Col span={15}>
          <Form.Item
            name='dhcpPools'
            children={<DHCPPoolTable></DHCPPoolTable>}
          />
        </Col>
      </Row>

      <Subtitle level={3}>
        { $t({ defaultMessage: 'Host' }) }
      </Subtitle>
      <Row gutter={20}>
        <Col span={15}>
          <Form.Item
            name='dhcpHosts'
            children={<DHCPHostTable></DHCPHostTable>}
          />
        </Col>
      </Row>

    </>
  )
}
