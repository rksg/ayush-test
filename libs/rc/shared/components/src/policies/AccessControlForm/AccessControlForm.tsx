import { useRef } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, StepsFormLegacy, StepsFormLegacyInstance } from '@acx-ui/components'
import {
  useAddAccessControlProfileMutation,
  useAddAccessControlProfileTemplateMutation,
  useUpdateAccessControlProfileMutation,
  useUpdateAccessControlProfileTemplateMutation
} from '@acx-ui/rc/services'
import {
  AccessControlFormFields,
  AccessControlInfoType,
  AccessControlProfile,
  generatePolicyPageHeaderTitle,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  useConfigTemplate,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateTenantLink,
  usePolicyListBreadcrumb
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { AccessControlSettingForm } from './AccessControlSettingForm'


type AccessControlFormProps = {
  editMode: boolean
}

export interface editModeProps {
  id: string,
  isEdit: boolean
}

export interface AddModeProps {
  enable: boolean,
  visible: boolean
}

export const genAclPayloadObject = (accessControlProfile: AccessControlFormFields) => {
  let aclPayloadObject = {} as AccessControlFormFields

  aclPayloadObject.policyName = accessControlProfile.policyName!
  aclPayloadObject.description = accessControlProfile.description
  aclPayloadObject.enableLayer2 = accessControlProfile.enableLayer2
  aclPayloadObject.l2AclPolicyId = accessControlProfile.l2AclPolicyId
  aclPayloadObject.enableLayer3 = accessControlProfile.enableLayer3
  aclPayloadObject.l3AclPolicyId = accessControlProfile.l3AclPolicyId
  aclPayloadObject.enableDeviceOs = accessControlProfile.enableDeviceOs
  aclPayloadObject.devicePolicyId = accessControlProfile.devicePolicyId
  aclPayloadObject.enableApplications = accessControlProfile.enableApplications
  aclPayloadObject.applicationPolicyId = accessControlProfile.applicationPolicyId
  aclPayloadObject.enableClientRateLimit =
    accessControlProfile.rateLimiting?.enableUploadLimit
    || accessControlProfile.rateLimiting?.enableUploadLimit

  aclPayloadObject.rateLimiting = {}

  if (accessControlProfile.rateLimiting?.uplinkLimit
    && accessControlProfile.rateLimiting?.uplinkLimit > 0
  ) {
    aclPayloadObject.rateLimiting.enableUploadLimit = true
    aclPayloadObject.rateLimiting.uplinkLimit = accessControlProfile.rateLimiting?.uplinkLimit
  }

  if (accessControlProfile.rateLimiting?.downlinkLimit
    && accessControlProfile.rateLimiting?.downlinkLimit > 0
  ) {
    aclPayloadObject.rateLimiting.enableDownloadLimit = true
    aclPayloadObject.rateLimiting.downlinkLimit = accessControlProfile.rateLimiting?.downlinkLimit
  }

  return aclPayloadObject
}

export const convertToPayload = (
  editMode: boolean,
  accessControlProfile: AccessControlFormFields,
  policyId: string | undefined) => {
  let payload = {} as AccessControlInfoType
  if (editMode) {
    payload.id = policyId ?? ''
  }

  payload.name = accessControlProfile.policyName
  payload.description = accessControlProfile.description ?? ''

  if (accessControlProfile.enableLayer2) {
    payload.l2AclPolicy = {
      enabled: true,
      id: accessControlProfile.l2AclPolicyId!
    }
  }

  if (accessControlProfile.enableLayer3) {
    payload.l3AclPolicy = {
      enabled: true,
      id: accessControlProfile.l3AclPolicyId!
    }
  }

  if (accessControlProfile.enableDeviceOs) {
    payload.devicePolicy = {
      enabled: true,
      id: accessControlProfile.devicePolicyId!
    }
  }

  if (accessControlProfile.enableApplications) {
    payload.applicationPolicy = {
      enabled: true,
      id: accessControlProfile.applicationPolicyId!
    }
  }

  if (accessControlProfile.rateLimiting?.enableDownloadLimit
    || accessControlProfile.rateLimiting?.enableUploadLimit) {
    payload.rateLimiting = {
      enabled: true,
      uplinkLimit: accessControlProfile.rateLimiting?.uplinkLimit ?? 0,
      downlinkLimit: accessControlProfile.rateLimiting?.downlinkLimit ?? 0
    }
  }

  return payload
}

export const AccessControlForm = (props: AccessControlFormProps) => {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const params = useParams()
  const navigate = useNavigate()
  // eslint-disable-next-line max-len
  const tablePath = getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.LIST })
  const linkToPolicies = useTenantLink(tablePath)
  const templateBasePath = useConfigTemplateTenantLink('')
  const { editMode } = props

  const formRef = useRef<StepsFormLegacyInstance<AccessControlFormFields>>()

  const [ createAclProfile ] = useConfigTemplateMutationFnSwitcher(
    useAddAccessControlProfileMutation, useAddAccessControlProfileTemplateMutation)

  const [ updateAclProfile ] = useConfigTemplateMutationFnSwitcher(
    useUpdateAccessControlProfileMutation, useUpdateAccessControlProfileTemplateMutation)

  const handleAccessControlPolicy = async (editMode: boolean) => {
    try {
      const aclPayloadObject = genAclPayloadObject(
        formRef.current?.getFieldsValue() as AccessControlFormFields
      )
      if (!editMode) {
        await createAclProfile({
          params: params,
          payload: convertToPayload(false, aclPayloadObject, params.policyId)
        }).unwrap()
      } else {
        await updateAclProfile({
          params: params,
          payload: convertToPayload(true, aclPayloadObject, params.policyId)
        }).unwrap()
      }

      navigate(isTemplate ? templateBasePath : linkToPolicies, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const breadcrumb = usePolicyListBreadcrumb(PolicyType.ACCESS_CONTROL)

  return (
    <>
      <PageHeader
        title={generatePolicyPageHeaderTitle(editMode, isTemplate, PolicyType.ACCESS_CONTROL)}
        breadcrumb={breadcrumb}
      />
      <StepsFormLegacy<AccessControlProfile>
        formRef={formRef}
        editMode={editMode}
        onCancel={() => navigate(isTemplate ? templateBasePath : linkToPolicies, { replace: true })}
        onFinish={() => handleAccessControlPolicy(editMode)}
      >
        <StepsFormLegacy.StepForm<AccessControlProfile>
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <AccessControlSettingForm editMode={editMode}/>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
