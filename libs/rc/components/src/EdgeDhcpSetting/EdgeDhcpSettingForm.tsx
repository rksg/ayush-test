import { Col, Form, Input, InputNumber, Row, Select, Space, Switch } from 'antd'
import { useIntl }                                                   from 'react-intl'

import { Alert, StepsForm, Subtitle } from '@acx-ui/components'
import {
  EdgeDhcpSetting,
  LeaseTimeUnit
} from '@acx-ui/rc/utils'

import { ToggleButton } from '../ToggleButton'

import DHCPHostTable from './DhcpHost'
import DHCPPoolTable from './DhcpPool'

const { useWatch } = Form
const { Option } = Select

export const EdgeDhcpSettingForm = () => {

  const { $t } = useIntl()
  const [
    dhcpRelay,
    enableSecondaryDNSServer
  ] = [
    useWatch<boolean>('dhcpRelay'),
    useWatch<boolean>('enableSecondaryDNSServer')
  ]
  const initDhcpData: Partial<EdgeDhcpSetting> = {
    leaseTime: 24,
    leaseTimeUnit: LeaseTimeUnit.HOURS
  }

  return (
    <>
      <Row gutter={20}>
        <Col span={7}>
          <Subtitle level={3}>
            { $t({ defaultMessage: 'Settings' }) }
          </Subtitle>
          <Form.Item
            name='serviceName'
            label={$t({ defaultMessage: 'Service Name' })}
            rules={[{
              required: true
            }]}
            children={<Input />}
          />
          <StepsForm.FieldLabel width='100px'>
            {$t({ defaultMessage: 'DHCP Relay:' })}
            <Form.Item
              name='dhcpRelay'
              valuePropName='checked'
              initialValue={false}
              children={<Switch />}
            />
          </StepsForm.FieldLabel>
          {dhcpRelay &&
            <>
              <Form.Item
                name='externalDhcpServerFqdnIp'
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
          <Form.Item
            name='domainName'
            label={$t({ defaultMessage: 'Domain Name' })}
            children={<Input />}
          />
          <Form.Item
            name='primaryDnsIp'
            label={$t({ defaultMessage: 'Primary DNS Server' })}
            children={<Input />}
          />
          <Form.Item noStyle name='enableSecondaryDNSServer'>
            <ToggleButton
              enableText={$t({ defaultMessage: 'Remove Secondary DNS Server' })}
              disableText={$t({ defaultMessage: 'Add Secondary DNS Server' })}
            />
          </Form.Item>
          {enableSecondaryDNSServer &&
              <Form.Item
                name='secondaryDnsIp'
                label={$t({ defaultMessage: 'Secondary DNS Server' })}
                children={<Input />}
              />
          }
          <Form.Item label={$t({ defaultMessage: 'Lease Time' })}>
            <Space align='start'>
              <Form.Item
                noStyle
                name='leaseTime'
                label={$t({ defaultMessage: 'Lease Time' })}
                rules={[
                  { required: true }
                ]}
                initialValue={initDhcpData.leaseTime}
              >
                <InputNumber min={1} max={1440} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                noStyle
                name='leaseTimeUnit'
                initialValue={initDhcpData.leaseTimeUnit}>
                <Select >
                  <Option value={'DAYS'}>{$t({ defaultMessage: 'Days' })}</Option>
                  <Option value={'HOURS'}>{$t({ defaultMessage: 'Hours' })}</Option>
                  <Option value={'MINUTES'}>{$t({ defaultMessage: 'Minutes' })}</Option>
                </Select>
              </Form.Item>
            </Space>
          </Form.Item>
        </Col>
      </Row>

      <Subtitle level={3}>
        { $t({ defaultMessage: 'Set DHCP Pools' }) }
      </Subtitle>
      <Row gutter={20}>
        <Col span={15}>
          <Form.Item
            name='dhcpPools'
            rules={[
              { required: true, message: $t({ defaultMessage: 'Please create DHCP pools' }) }
            ]}
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
            name='hosts'
            children={<DHCPHostTable></DHCPHostTable>}
          />
        </Col>
      </Row>

    </>
  )
}
