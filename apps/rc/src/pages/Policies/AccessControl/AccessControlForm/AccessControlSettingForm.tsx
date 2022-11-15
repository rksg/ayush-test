import { MutableRefObject } from 'react'

import { ProFormInstance } from '@ant-design/pro-form'
import { Form, Input }     from 'antd'
import { useIntl }         from 'react-intl'
import { useParams }       from 'react-router-dom'

import { GridCol, GridRow }     from '@acx-ui/components'
import { StepsForm }            from '@acx-ui/components'
import { AccessControlProfile } from '@acx-ui/rc/utils'
import AccessControlComponent from './AccessControlComponent';

type AccessControlSettingFormProps = {
  edit: boolean,
  formRef?: MutableRefObject<ProFormInstance<AccessControlProfile> | undefined>
}

const AccessControlSettingForm = (props: AccessControlSettingFormProps) => {
  const { $t } = useIntl()
  const { edit, formRef } = props
  const params = useParams()

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
          name='tags'
          label={$t({ defaultMessage: 'Tags' })}
          initialValue={''}
          children={<Input />}
        />
        <Form.Item
          name='accessControlComponent'
          label={$t({ defaultMessage: 'Access control components' })}
          initialValue={''}
          children={<AccessControlComponent />}
        />
      </GridCol>
    </GridRow>
  )
}

export default AccessControlSettingForm
