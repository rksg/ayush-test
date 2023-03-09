import { Checkbox, Form, Input, InputNumber, Radio, Space } from 'antd'
import _                                                    from 'lodash'
import { useIntl }                                          from 'react-intl'

import { networkWifiIpRegExp, SnmpNotificationTypeEnum, SnmpV2Agent, SnmpV3Agent } from '@acx-ui/rc/utils'

const { useWatch } = Form

export const HasReadPrivilegeEnabled = (data: SnmpV2Agent[] | SnmpV3Agent[]) => {
  return _.some(data, ['readPrivilege', true])
}

export const HasTrapPrivilegeEnabled = (data: SnmpV2Agent[] | SnmpV3Agent[]) => {
  return _.some(data, ['trapPrivilege', true])
}

export const HasAllPrivilegeEnabled = (data: SnmpV2Agent[] | SnmpV3Agent[]) => {
  return _.some(data, ['readPrivilege', true]) && _.some(data, ['trapPrivilege', true])
}

type PrivilegeFormProps = {
  hasNoPrivilegeError: boolean,
  hasOtherReadPrivilegeEnabled: boolean,
  hasOtherTrapPrivilegeEnabled: boolean
}

const PrivilegeForm = (props: PrivilegeFormProps) => {
  const { $t } = useIntl()
  const {
    hasNoPrivilegeError=false,
    hasOtherReadPrivilegeEnabled=false,
    hasOtherTrapPrivilegeEnabled=false } = props

  const trapPrivilege = useWatch<boolean>('trapPrivilege')

  return (<>
    <Form.Item label={$t({ defaultMessage: 'Privilege' })} style={{ marginBottom: '0' }}>
      <Form.Item
        name='readPrivilege'
        valuePropName='checked'
        style={{ marginBottom: '0' }}
        initialValue={false}
        children={
          <Checkbox disabled={hasOtherReadPrivilegeEnabled}>
            {$t({ defaultMessage: 'Read-only' })}
          </Checkbox>
        }
      />
      <Form.Item
        name='trapPrivilege'
        valuePropName='checked'
        style={{ marginBottom: '0' }}
        initialValue={false}
        children={
          <Checkbox disabled={hasOtherTrapPrivilegeEnabled}>
            {$t({ defaultMessage: 'Notification' })}
          </Checkbox>
        }
      />
    </Form.Item>
    {hasNoPrivilegeError &&
      <div style={{ color: 'red' }}>
        {$t({ defaultMessage: 'Please enable at least one privilege option.' })}
      </div>
    }
    {trapPrivilege && <>
      <Form.Item
        name='notificationType'
        style={{ marginLeft: '20px' }}
        initialValue={SnmpNotificationTypeEnum.Trap}
        children={
          <Radio.Group>
            <Space direction='vertical'>
              <Radio key='Trap' value={'Trap'}>
                {$t({ defaultMessage: 'Trap' })}
              </Radio>
              <Radio key='Inform' value={'Inform'}>
                {$t({ defaultMessage: 'Inform' })}
              </Radio>
            </Space>
          </Radio.Group>
        }
      />
      <div>
        <Form.Item
          name='targetAddr'
          label={$t({ defaultMessage: 'Target IP' })}
          style={{ display: 'inline-block', width: '250px', paddingRight: '10px' }}
          rules={[
            { required: true },
            { validator: (_, value) => networkWifiIpRegExp(value) }
          ]}
          children={<Input />}
        />
        <Form.Item
          name='targetPort'
          label={$t({ defaultMessage: 'Port' })}
          style={{ display: 'inline-block', width: '90px' }}
          initialValue={162}
          rules={[
            { required: true },
            { type: 'number', min: 1 },
            { type: 'number', max: 65535 }
          ]}
          children={<InputNumber min={1} max={65535} />}
        />
      </div>
    </>
    }
  </>
  )
}

export default PrivilegeForm
