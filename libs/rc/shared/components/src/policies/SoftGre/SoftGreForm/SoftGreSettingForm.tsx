import { Col, Form, Input, InputNumber, Radio, Row, Space, Switch } from 'antd'
import { useIntl }                                                  from 'react-intl'
import { useParams }                                                from 'react-router-dom'

import { Tooltip }                                                                         from '@acx-ui/components'
import { useLazyGetSoftGreViewDataListQuery }                                              from '@acx-ui/rc/services'
import { MtuTypeEnum, networkWifiIpRegExp, servicePolicyNameRegExp, checkObjectNotExists } from '@acx-ui/rc/utils'

import { messageMapping } from './messageMapping'
import * as UI            from './styledComponents'

const { useWatch } = Form

export const SoftGreSettingForm = () => {
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()
  const mtuType = useWatch('mtuType')
  const [ getSoftGreViewDataList ] = useLazyGetSoftGreViewDataListQuery()

  const listPayload = {
    fields: ['name', 'id'],
    searchString: '',
    searchTargetFields: ['name'],
    filters: {},
    pageSize: 10_000
  }

  const nameValidator = async (value: string) => {
    const payload = { ...listPayload, searchString: value }
    // eslint-disable-next-line max-len
    const list = (await getSoftGreViewDataList({ params, payload }).unwrap()).data.filter(n => n.id !== params.policyId).map(n => ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value }, $t({ defaultMessage: 'SoftGRE' }))
  }

  return (
    <Row>
      <Col span={11}>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Profile Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (_, value) => nameValidator(value) },
            { validator: (_, value) => servicePolicyNameRegExp(value) }
          ]}
          validateFirst
          hasFeedback
          initialValue={''}
          children={<Input/>}
          validateTrigger={'onBlur'}
        />
        <Form.Item
          name='description'
          label={$t({ defaultMessage: 'Description' })}
          initialValue=''
          rules={[
            { max: 64 }
          ]}
          children={<Input.TextArea rows={2} />}
        />
        <Form.Item
          name='primaryGatewayAddress'
          label={$t({ defaultMessage: 'Tunnel Primary Gateway Address' })}
          rules={[
            { required: true },
            { validator: (_, value) => networkWifiIpRegExp(value) }
          ]}
          children={<Input />}
          validateFirst
          hasFeedback
        />
        <Form.Item
          name='secondaryGatewayAddress'
          label={$t({ defaultMessage: 'Tunnel Secondary Gateway Address' })}
          rules={[
            { validator: (_, value) => networkWifiIpRegExp(value) },
            { validator: (_, value) => {
              const primaryGatewayAddress = form.getFieldValue('primaryGatewayAddress')
              return (value && primaryGatewayAddress && primaryGatewayAddress === value) ?
                Promise.reject(`${$t( { defaultMessage: 'IP address must be unique.' })}`) :
                Promise.resolve()
            } }
          ]}
          children={<Input />}
          validateFirst
          hasFeedback
        />
      </Col>
      <Col span={24}>
        <Form.Item
          name='mtuType'
          initialValue={MtuTypeEnum.AUTO}
          label={$t({ defaultMessage: 'Gateway Path MTU Mode' })}
          tooltip={$t(messageMapping.mtu_tooltip)}
          extra={
            <Space size={1} style={{ alignItems: 'start', marginTop: 5 }}>
              {
                mtuType === MtuTypeEnum.MANUAL
                  ? (<><UI.InfoIcon />
                    { $t(messageMapping.mtu_help_msg) }</>)
                  : null
              }
            </Space>
          }
          children={
            <Radio.Group>
              <Space direction='vertical'>
                <Radio value={MtuTypeEnum.AUTO} >
                  {$t({ defaultMessage: 'Auto' })}
                </Radio>
                <Radio value={MtuTypeEnum.MANUAL}>
                  <Space>
                    <div>
                      {$t({ defaultMessage: 'Manual' })}
                    </div>
                    {
                      mtuType === MtuTypeEnum.MANUAL &&
                      <Space>
                        <Form.Item
                          name='mtuSize'
                          rules={[
                            {
                              required: mtuType === MtuTypeEnum.MANUAL,
                              message: 'Please enter Gateway Path MTU Mode'
                            },
                            {
                              type: 'number', min: 850, max: 9018,
                              message: $t({
                                defaultMessage: 'Gateway Path MTU Mode must be between 850 and 9018'
                              })
                            }
                          ]}
                          children={
                            <InputNumber style={{ width: '125px' }} placeholder='850-9018'/>}
                          validateFirst
                          noStyle
                          hasFeedback
                        />
                        <div>{$t({ defaultMessage: 'bytes' })}</div>
                      </Space>
                    }
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          }
        />
      </Col>
      <Col span={24}>
        <Form.Item
          style={{ marginBottom: '10px' }}
          label={<>
            { $t({ defaultMessage: 'ICMP Keep Alive Interval' }) }
            <Tooltip.Question
              title={$t(messageMapping.keep_alive_interval_tooltip)}
              placement='bottom'
            />
          </>}
          required
        >
          <Space>
            <Form.Item
              name='keepAliveInterval'
              initialValue={10}
              rules={[
                {
                  required: true,
                  message: $t({ defaultMessage: 'Please enter ICMP Keep Alive Interval' })
                },
                {
                  type: 'number', min: 1, max: 180,
                  message: $t({
                    defaultMessage: 'ICMP Keep Alive Interval must be between 1 and 180'
                  })
                }
              ]}
              children={<InputNumber style={{ width: '60px' }}/>}
              validateFirst
              noStyle
              hasFeedback
            />
            <div>{$t({ defaultMessage: 'seconds' })}</div>
          </Space>
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item
          style={{ marginBottom: '10px' }}
          label={<>
            { $t({ defaultMessage: 'ICMP Keep Alive Retries' }) }
            <Tooltip.Question
              title={$t(messageMapping.keep_alive_retry_tooltip)}
              placement='bottom'
            />
          </>}
          required
        >
          <Space>
            <Form.Item
              name='keepAliveRetryTimes'
              initialValue={5}
              rules={[
                {
                  required: true,
                  message: $t({ defaultMessage: 'Please enter ICMP Keep Alive Retries' })
                },
                { type: 'number', min: 2, max: 10 }
              ]}
              children={<InputNumber style={{ width: '60px' }}/>}
              validateFirst
              noStyle
              hasFeedback
            />
            <div>{$t({ defaultMessage: 'retries' })}</div>
          </Space>
        </Form.Item>
      </Col>
      <Col span={11}>
        <UI.StyledSpace align='center'>
          <UI.FormItemWrapper>
            <Form.Item
              label={$t({ defaultMessage: 'Disassociate Clients on Tunnel Failover' })}
              tooltip={$t(messageMapping.disassoicate_client_tooltip)}
            />
          </UI.FormItemWrapper>
          <Form.Item
            name='disassociateClientEnabled'
            initialValue={false}
            valuePropName='checked'
            children={<Switch />}
          />
        </UI.StyledSpace>
      </Col>
    </Row>
  )
}