
import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { GridCol, GridRow } from '@acx-ui/components'
import { StepsForm }        from '@acx-ui/components'

import AccessControlComponent from './AccessControlComponent'

const AccessControlSettingForm = () => {
  const { $t } = useIntl()

  return (
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsForm.Title>{$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
        <Form.Item
          name='policyName'
          label={$t({ defaultMessage: 'Policy Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 }
          ]}
          validateFirst
          hasFeedback
          initialValue={''}
          children={<Input />}
        />
        <Form.Item
          name='description'
          label={$t({ defaultMessage: 'Description' })}
          initialValue={''}
          children={<Input />}
        />
      </GridCol>
      <GridCol col={{ span: 15 }}>
        <Form.Item
          name='accessControlComponent'
          label={$t({ defaultMessage: 'Access Control Components' })}
          rules={[
            { required: true }
          ]}
          initialValue={{
            layer2: {
              macAddressList: [],
              access: 'ALLOW'
            },
            layer3: {
              ruleList: [],
              defaultAccess: 'ALLOW',
              access: 'ALLOW'
            },
            deviceOS: {
              ruleList: [],
              defaultAccess: 'ALLOW',
              access: 'ALLOW'
            },
            applications: {
              ruleList: []
            }
          }}
          children={<AccessControlComponent />}
        />
      </GridCol>
    </GridRow>
  )
}

export default AccessControlSettingForm
