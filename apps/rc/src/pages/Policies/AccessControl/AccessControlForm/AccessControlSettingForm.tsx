
import { useEffect } from 'react'

import { Form, Input } from 'antd'
import { get }         from 'lodash'
import { useIntl }     from 'react-intl'
import { useParams }   from 'react-router-dom'

import { GridCol, GridRow }                                                     from '@acx-ui/components'
import { StepsFormLegacy }                                                      from '@acx-ui/components'
import { useGetAccessControlProfileListQuery, useGetAccessControlProfileQuery } from '@acx-ui/rc/services'
import { AclEmbeddedObject }                                                    from '@acx-ui/rc/utils'

import AccessControlComponent from './AccessControlComponent'

type AccessControlSettingFormProps = {
  editMode: boolean,
  embeddedMode?: boolean,
  embeddedObject?: AclEmbeddedObject
}

const AccessControlSettingForm = (props: AccessControlSettingFormProps) => {
  const { $t } = useIntl()
  const {
    editMode,
    embeddedMode = false,
    embeddedObject = {} as AclEmbeddedObject
  } = props
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
      if (get(data, 'devicePolicy')) {
        form.setFieldValue('enableDeviceOs', true)
        form.setFieldValue('devicePolicyId', data.devicePolicy?.id)
      }
      if (get(data, 'applicationPolicy')) {
        form.setFieldValue('enableApplications', true)
        form.setFieldValue('applicationPolicyId', data.applicationPolicy?.id)
      }
      if (get(data, 'rateLimiting')) {
        const rateLimiting = get(data, 'rateLimiting')
        form.setFieldValue('enableClientRateLimit', true)
        form.setFieldValue(['rateLimiting', 'uplinkLimit'], rateLimiting?.uplinkLimit ?? 0)
        form.setFieldValue(['rateLimiting', 'enableUploadLimit'],
          rateLimiting?.uplinkLimit && rateLimiting?.uplinkLimit > 0
        )
        form.setFieldValue(['rateLimiting', 'downlinkLimit'], rateLimiting?.downlinkLimit ?? 0)
        form.setFieldValue(['rateLimiting', 'enableDownloadLimit'],
          rateLimiting?.downlinkLimit && rateLimiting?.downlinkLimit > 0
        )
      }

    }
  }, [form, data, editMode])

  useEffect(() => {
    if (form && embeddedMode) {
      form.setFieldValue('enableLayer2', Boolean(embeddedObject?.l2AclPolicyId))
      form.setFieldValue('l2AclPolicyId', embeddedObject?.l2AclPolicyId)
      form.setFieldValue('enableLayer3', Boolean(embeddedObject?.l3AclPolicyId))
      form.setFieldValue('l3AclPolicyId', embeddedObject?.l3AclPolicyId)
      form.setFieldValue('enableDeviceOs', Boolean(embeddedObject?.devicePolicyId))
      form.setFieldValue('devicePolicyId', embeddedObject?.devicePolicyId)
      form.setFieldValue('enableApplications', Boolean(embeddedObject?.applicationPolicyId))
      form.setFieldValue('applicationPolicyId', embeddedObject?.applicationPolicyId)
      form.setFieldValue(
        'enableClientRateLimit', Boolean(
          embeddedObject?.uplinkLimit || embeddedObject?.downlinkLimit
        )
      )
      form.setFieldValue(['rateLimiting', 'uplinkLimit'], embeddedObject?.uplinkLimit ?? 0)
      form.setFieldValue(['rateLimiting', 'enableUploadLimit'],
        embeddedObject?.uplinkLimit && embeddedObject?.uplinkLimit > 0
      )
      form.setFieldValue(['rateLimiting', 'downlinkLimit'], embeddedObject?.downlinkLimit ?? 0)
      form.setFieldValue(['rateLimiting', 'enableDownloadLimit'],
        embeddedObject?.downlinkLimit && embeddedObject?.downlinkLimit > 0
      )
    }
  }, [form, embeddedMode, embeddedObject])

  return (
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Settings' })}</StepsFormLegacy.Title>
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
          rules={[
            { max: 255 }
          ]}
          initialValue={''}
          children={<Input />}
        />
      </GridCol>
      <GridCol col={{ span: 15 }}>
        <Form.Item
          name='accessControlComponent'
          label={$t({ defaultMessage: 'Access Control Components' })}
          children={<AccessControlComponent />}
        />
      </GridCol>
    </GridRow>
  )
}

export default AccessControlSettingForm
