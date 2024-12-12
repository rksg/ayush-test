
import React, { useEffect, useRef } from 'react'

import { Form, Input } from 'antd'
import { get }         from 'lodash'
import { useIntl }     from 'react-intl'

import { GridCol, GridRow }                     from '@acx-ui/components'
import { StepsFormLegacy }                      from '@acx-ui/components'
import { Features, useIsSplitOn }               from '@acx-ui/feature-toggle'
import {
  useGetAccessControlProfileQuery,
  useGetAccessControlProfileTemplateQuery,
  useGetEnhancedAccessControlProfileListQuery
} from '@acx-ui/rc/services'
import {
  useGetAccessControlProfileTemplateListQuery
} from '@acx-ui/rc/services'
import {
  AccessControlInfoType,
  AclEmbeddedObject, EnhancedAccessControlInfoType,
  useConfigTemplate, useConfigTemplateQueryFnSwitcher,
  useTableQuery
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import AccessControlComponent    from './AccessControlComponent'
import { QUERY_DEFAULT_PAYLOAD } from './constants'

type AccessControlSettingFormProps = {
  editMode: boolean,
  embeddedMode?: boolean,
  embeddedObject?: AclEmbeddedObject
}

export const AccessControlSettingForm = (props: AccessControlSettingFormProps) => {
  const { $t } = useIntl()
  const {
    editMode,
    embeddedMode = false,
    embeddedObject = {} as AclEmbeddedObject
  } = props
  const fetchDone = useRef(false)

  const form = Form.useFormInstance()

  const data = useGetAclPolicyInstance(editMode)

  const aclProfileList : AccessControlInfoType[] = useGetAclPolicyListInstance()

  useEffect(() => {
    if (data?.name && editMode && !fetchDone.current) {
      form.setFieldValue('oldPayload', data)
      form.setFieldValue('policyName', data.name)
      form.setFieldValue('description', get(data, 'description'))
      if (get(data, 'l2AclPolicyId')) {
        form.setFieldValue('enableLayer2', true)
        form.setFieldValue('l2AclPolicyId', data.l2AclPolicyId)
      }
      if (get(data, 'l3AclPolicyId')) {
        form.setFieldValue('enableLayer3', true)
        form.setFieldValue('l3AclPolicyId', data.l3AclPolicyId)
      }
      if (get(data, 'devicePolicyId')) {
        form.setFieldValue('enableDeviceOs', true)
        form.setFieldValue('devicePolicyId', data.devicePolicyId)
      }
      if (get(data, 'applicationPolicyId')) {
        form.setFieldValue('enableApplications', true)
        form.setFieldValue('applicationPolicyId', data.applicationPolicyId)
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

      fetchDone.current = true
    }
  }, [form, data, editMode])

  useEffect(() => {
    if (embeddedObject && embeddedMode) {
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
      // eslint-disable-next-line max-len
      form.setFieldValue(['rateLimiting', 'downlinkLimit'], embeddedObject?.downlinkLimit ?? 0)
      form.setFieldValue(['rateLimiting', 'enableDownloadLimit'],
        embeddedObject?.downlinkLimit && embeddedObject?.downlinkLimit > 0
      )
    }
  }, [embeddedObject])

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
                  .filter((aclProfile) => (editMode ? (aclProfile.name !== data.name) : true))
                  .some((aclProfile) => aclProfile.name === value)) {
                return Promise.reject(
                  $t({ defaultMessage: 'The access control profile with that name already exists' })
                )
              }
              return Promise.resolve()
            } }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />
        <Form.Item
          name='description'
          label={$t({ defaultMessage: 'Description' })}
          rules={[
            { max: 64 }
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

const useGetAclPolicyListInstance = () => {
  const params = useParams()
  const { isTemplate } = useConfigTemplate()

  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : enableRbac

  const tableQuery = useGetAccessControlProfileTemplateListQuery({
    params,
    payload: QUERY_DEFAULT_PAYLOAD,
    enableRbac: resolvedRbacEnabled
  }, { skip: !isTemplate })

  const useAclPolicyTemplateList = (tableQuery?.data?.data ?? []) as AccessControlInfoType[]

  const nonTableQuery = useTableQuery({
    useQuery: useGetEnhancedAccessControlProfileListQuery,
    defaultPayload: QUERY_DEFAULT_PAYLOAD,
    enableRbac,
    option: {
      skip: isTemplate
    }
  })

  const useAclPolicyList = nonTableQuery?.data?.data as AccessControlInfoType[]

  return isTemplate ? useAclPolicyTemplateList : (useAclPolicyList ?? [])
}

const useGetAclPolicyInstance = (editMode: boolean) => {
  const params = useParams()
  const { isTemplate } = useConfigTemplate()

  const isServiceRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const enableRbac = isTemplate ? isConfigTemplateRbacEnabled : isServiceRbacEnabled

  const defaultPayload = {
    filters: { id: [params.policyId] },
    searchString: '',
    fields: [],
    page: 1
  }

  const tableQuery = useTableQuery({
    useQuery: useGetEnhancedAccessControlProfileListQuery,
    defaultPayload,
    enableRbac,
    option: {
      skip: !editMode || isTemplate
    }
  })

  const { data } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetAccessControlProfileQuery,
    useTemplateQueryFn: useGetAccessControlProfileTemplateQuery,
    enableRbac: enableRbac,
    skip: !editMode
  })

  const aclPolicyData = tableQuery?.data?.data[0]

  const aclPolicyDataWithExtra = {
    ...aclPolicyData,
    description: data?.description || '',
    rateLimiting: data?.rateLimiting
  }

  const templateTableQuery = useTableQuery({
    useQuery: useGetAccessControlProfileTemplateListQuery,
    defaultPayload,
    enableRbac,
    option: {
      skip: !editMode || !isTemplate
    }
  })

  const aclTemplatePolicyData = templateTableQuery?.data?.data[0]

  const aclTemplatePolicyDataWithExtra = {
    ...aclTemplatePolicyData,
    description: data?.description || '',
    rateLimiting: data?.rateLimiting
  }

  // eslint-disable-next-line max-len
  return ((isTemplate ? aclTemplatePolicyDataWithExtra : aclPolicyDataWithExtra) || {}) as EnhancedAccessControlInfoType
}
