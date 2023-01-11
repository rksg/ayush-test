
import { useEffect } from 'react'

import { Form, Input } from 'antd'
import { get }         from 'lodash'
import { useIntl }     from 'react-intl'
import { useParams }   from 'react-router-dom'

import { GridCol, GridRow }                                                     from '@acx-ui/components'
import { StepsForm }                                                            from '@acx-ui/components'
import { useGetAccessControlProfileListQuery, useGetAccessControlProfileQuery } from '@acx-ui/rc/services'

import AccessControlComponent from './AccessControlComponent'

type AccessControlSettingFormProps = {
  editMode: boolean
}

const AccessControlSettingForm = (props: AccessControlSettingFormProps) => {
  const { $t } = useIntl()
  const { editMode } = props
  const params = useParams()
  const form = Form.useFormInstance()

  const { data } = useGetAccessControlProfileQuery({ params }, { skip: !editMode })

  const { data: aclProfileList } = useGetAccessControlProfileListQuery({ params })

  useEffect(() => {
    if (data) {
      form.setFieldValue('policyName', data.name)
      form.setFieldValue('description', get(data, 'description'))
      if (get(data, 'l2AclPolicy')) {
        form.setFieldValue('enableLayer2', true)
        form.setFieldValue('l2AclPolicyId', data.l2AclPolicy?.id)
      }
      if (get(data, 'l3AclPolicy')) {
        form.setFieldValue('enableLayer3', true)
        form.setFieldValue('l3AclPolicyId', data.l3AclPolicy?.id)
      }

    }
  }, [data, editMode])

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
            { max: 32 },
            { validator: async (rule, value) => {
              if (value && aclProfileList &&
                aclProfileList
                  .filter((aclProfile) => editMode ? (aclProfile.name !== value) : true)
                  .findIndex((aclProfile) => aclProfile.name === value) !== -1) {
                return Promise.reject(
                  $t({ defaultMessage: 'The access control profile with that name already exists' })
                )
              }
              return Promise.resolve()
            } }
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
            { validator: async () => {
              if (form.getFieldValue('enableLayer2') && !form.getFieldValue('l2AclPolicyId')) {
                return Promise.reject($t({ defaultMessage: 'l2AclPolicy could not be empty' }))
              }
              if (form.getFieldValue('enableLayer3') && !form.getFieldValue('l3AclPolicyId')) {
                return Promise.reject($t({ defaultMessage: 'l3AclPolicy could not be empty' }))
              }

              return Promise.resolve()
            } }
          ]}
          children={<AccessControlComponent />}
        />
      </GridCol>
    </GridRow>
  )
}

export default AccessControlSettingForm
