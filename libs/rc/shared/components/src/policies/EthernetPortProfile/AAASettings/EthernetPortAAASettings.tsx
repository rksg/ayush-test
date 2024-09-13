import { Form, Space, Switch } from 'antd'
import { useWatch }            from 'antd/lib/form/Form'
import { useIntl }             from 'react-intl'

import { Subtitle , StepsForm } from '@acx-ui/components'

import { AAAInstance } from '../../../NetworkForm/AAAInstance'


export function EthernetPortAAASettings () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const accountingEnabled = useWatch('accountingEnabled', form)
  const labelWidth = '280px'

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <Subtitle level={3}>{ $t({ defaultMessage: 'Authentication Service' }) }</Subtitle>
        <AAAInstance serverLabel={$t({ defaultMessage: 'Authentication Server' })}
          type='authRadius'/>
        <StepsForm.FieldLabel width={labelWidth}>
          {$t({ defaultMessage: 'Use Proxy Service' })}
          <Form.Item
            name='enableAuthProxy'
            valuePropName='checked'
            initialValue={false}
            children={<Switch/>}
          />
        </StepsForm.FieldLabel>
      </div>
      <div>
        <StepsForm.FieldLabel width={labelWidth}>
          <Subtitle level={3}>{ $t({ defaultMessage: 'Accounting Service' }) }</Subtitle>
          <Form.Item
            name='accountingEnabled'
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
        </StepsForm.FieldLabel>
        {accountingEnabled && <>
          <AAAInstance serverLabel={$t({ defaultMessage: 'Accounting Server' })}
            type='accountingRadius'/>
          <StepsForm.FieldLabel width={labelWidth}>
            {$t({ defaultMessage: 'Use Proxy Service' })}
            <Form.Item
              name='enableAccountingProxy'
              valuePropName='checked'
              initialValue={false}
              children={<Switch/>}
            />
          </StepsForm.FieldLabel>
        </>}
      </div>
    </Space>
  )
}