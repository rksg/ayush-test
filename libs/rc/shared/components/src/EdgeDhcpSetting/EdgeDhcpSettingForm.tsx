import { useEffect } from 'react'

import {
  Col,
  Form,
  Input,
  InputNumber,
  Radio,
  RadioChangeEvent,
  Row,
  Select,
  Space,
  Switch
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'
import styled      from 'styled-components'

import {
  Alert,
  StepsFormLegacy,
  Subtitle,
  useStepFormContext
} from '@acx-ui/components'
import {
  EdgeDhcpPool,
  EdgeDhcpSetting,
  LeaseTimeType,
  LeaseTimeUnit,
  networkWifiIpRegExp
} from '@acx-ui/rc/utils'

import { SpaceWrapper } from '../SpaceWrapper'
import { ToggleButton } from '../ToggleButton'

import DHCPHostTable   from './DhcpHost'
import DHCPOptionTable from './DhcpOption'
import DHCPPoolTable   from './DhcpPool'
import * as UI         from './styledComponents'

const { useWatch } = Form
const { Option } = Select

interface EdgeDhcpSettingFormProps {
  className?: string
}

export interface EdgeDhcpSettingFormData extends EdgeDhcpSetting {
  enableSecondaryDNSServer?: boolean
  leaseTimeType?: LeaseTimeType
}

export const EdgeDhcpSettingForm = styled((props: EdgeDhcpSettingFormProps) => {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EdgeDhcpSetting>()

  const [
    dhcpRelay,
    enableSecondaryDNSServer,
    leaseTimeType,
    leaseTime
  ] = [
    useWatch<boolean>('dhcpRelay'),
    useWatch<boolean>('enableSecondaryDNSServer'),
    useWatch('leaseTimeType'),
    form.getFieldValue('leaseTime')
  ]
  const initDhcpData: Partial<EdgeDhcpSetting> = {
    leaseTime: 24,
    leaseTimeUnit: LeaseTimeUnit.HOURS
  }

  const handleLeaseTimeRadioChange = (e: RadioChangeEvent) => {
    if(e.target.value === LeaseTimeType.LIMITED && leaseTime === -1) {
      form.setFieldValue('leaseTime', initDhcpData.leaseTime)
    }
  }

  const relayGatewayValidator = (pools: EdgeDhcpPool[], isRelayOn: boolean) => {
    for(let i = 0; i < pools.length; i++) {
      const pool = pools[i]

      if (isRelayOn && pool.gatewayIp) {
        return Promise.reject($t({
          defaultMessage: '{data} : gateway should be empty when relay is enabled'
        }, { data: pool.poolName }))
      } else if (!isRelayOn && !pool.gatewayIp) {
        return Promise.reject($t({
          defaultMessage: '{data} : gateway is required'
        }, { data: pool.poolName }))
      }
    }

    return Promise.resolve()
  }

  useEffect(() => {
    // do nothing when data is not ready.
    if (dhcpRelay === undefined) return
    const pools = form.getFieldValue('dhcpPools')

    // clear gateway field when relay is enabled
    if (dhcpRelay && pools) {
      const clonedPools = _.cloneDeep(pools)
      clonedPools.forEach((pool:EdgeDhcpPool) => {
        pool.gatewayIp = pool.gatewayIp ? '' : pool.gatewayIp
      })

      form.setFieldValue('dhcpPools', clonedPools)
      form.validateFields(['dhcpPools'])
    }
  }, [dhcpRelay])

  return (
    <div className={props.className}>
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
          <StepsFormLegacy.FieldLabel width='100px'>
            {$t({ defaultMessage: 'DHCP Relay:' })}
            <Form.Item
              name='dhcpRelay'
              valuePropName='checked'
              initialValue={false}
              children={<Switch />}
            />
          </StepsFormLegacy.FieldLabel>

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
          {
            !dhcpRelay &&
            <>
              <Form.Item
                name='primaryDnsIp'
                label={$t({ defaultMessage: 'Primary DNS Server' })}
                children={<Input />}
                rules={[
                  { validator: (_, value) => networkWifiIpRegExp(value) }
                ]}
              />
              <Form.Item noStyle name='enableSecondaryDNSServer'>
                <ToggleButton
                  enableText={$t({ defaultMessage: 'Remove Secondary DNS Server' })}
                  disableText={$t({ defaultMessage: 'Add Secondary DNS Server' })}
                />
              </Form.Item>
              {
                enableSecondaryDNSServer &&
                <Form.Item
                  name='secondaryDnsIp'
                  label={$t({ defaultMessage: 'Secondary DNS Server' })}
                  children={<Input />}
                  rules={[
                    { validator: (_, value) => networkWifiIpRegExp(value) }
                  ]}
                />
              }
              <Form.Item
                name='leaseTimeType'
                label={$t({ defaultMessage: 'Lease Time' })}
                rules={[{ required: true }]}
                initialValue={LeaseTimeType.LIMITED}
              >
                <Radio.Group onChange={handleLeaseTimeRadioChange}>
                  <Space direction='vertical'>
                    <Radio value={LeaseTimeType.LIMITED}>
                      {$t({ defaultMessage: 'Limit to' })}
                    </Radio>
                    {
                      leaseTimeType === LeaseTimeType.LIMITED &&
                      <Space align='start' className='ml-22'>
                        <Form.Item
                          name='leaseTime'
                          className='mb-0'
                          rules={[{ required: true }]}
                          initialValue={initDhcpData.leaseTime}
                        >
                          <InputNumber min={1} max={1440} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                          name='leaseTimeUnit'
                          initialValue={initDhcpData.leaseTimeUnit}>
                          <Select >
                            <Option value={LeaseTimeUnit.DAYS}>
                              {$t({ defaultMessage: 'Days' })}
                            </Option>
                            <Option value={LeaseTimeUnit.HOURS}>
                              {$t({ defaultMessage: 'Hours' })}
                            </Option>
                            <Option value={LeaseTimeUnit.MINUTES}>
                              {$t({ defaultMessage: 'Minutes' })}
                            </Option>
                          </Select>
                        </Form.Item>
                      </Space>
                    }
                    <Radio value={LeaseTimeType.INFINITE}>
                      {$t({ defaultMessage: 'Infinite' })}
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </>
          }
        </Col>
      </Row>

      <SpaceWrapper direction='vertical' size='middle' fullWidth>
        <Row gutter={20}>
          <Col span={24}>
            <Subtitle level={3}>
              { $t({ defaultMessage: 'Set DHCP Pools' }) }
            </Subtitle>
          </Col>
          <Col span={15}>
            <Form.Item
              name='dhcpPools'
              validateFirst
              dependencies={['dhcpRelay']}
              rules={[
                {
                  required: true,
                  message: $t({ defaultMessage: 'Please create DHCP pools' })
                },
                { validator: (_, value) => relayGatewayValidator(value, dhcpRelay) }
              ]}
              children={<DHCPPoolTable />}
            />
          </Col>
        </Row>

        {
          !dhcpRelay &&
          <>
            <Row gutter={20}>
              <Col span={24}>
                <Subtitle level={3}>
                  { $t({ defaultMessage: 'DHCP Option' }) }
                </Subtitle>
              </Col>
              <Col span={15}>
                <Form.Item
                  name='dhcpOptions'
                  children={<DHCPOptionTable />}
                />
              </Col>
            </Row>
            <Row gutter={20}>
              <Col span={24}>
                <Subtitle level={3}>
                  { $t({ defaultMessage: 'Host' }) }
                </Subtitle>
              </Col>
              <Col span={15}>
                <Form.Item
                  name='hosts'
                  children={<DHCPHostTable />}
                />
              </Col>
            </Row>
          </>
        }
      </SpaceWrapper>
    </div>
  )
})`${UI.styles}`
