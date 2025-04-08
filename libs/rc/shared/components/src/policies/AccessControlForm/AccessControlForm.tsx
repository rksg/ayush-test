import { useRef } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, StepsFormLegacy, StepsFormLegacyInstance } from '@acx-ui/components'
import { Features, useIsSplitOn }                               from '@acx-ui/feature-toggle'
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
  usePolicyPageHeaderTitle,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  useConfigTemplateMutationFnSwitcher,
  usePolicyListBreadcrumb, useConfigTemplate
} from '@acx-ui/rc/utils'
import { useNavigate } from '@acx-ui/react-router-dom'

import { usePathBasedOnConfigTemplate } from '../../configTemplates'

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
  // eslint-disable-next-line max-len
  aclPayloadObject.enableLayer2 = accessControlProfile.enableLayer2 || !!accessControlProfile.l2AclPolicyId
  aclPayloadObject.l2AclPolicyId = accessControlProfile.l2AclPolicyId
  // eslint-disable-next-line max-len
  aclPayloadObject.enableLayer3 = accessControlProfile.enableLayer3 || !!accessControlProfile.l3AclPolicyId
  aclPayloadObject.l3AclPolicyId = accessControlProfile.l3AclPolicyId
  // eslint-disable-next-line max-len
  aclPayloadObject.enableDeviceOs = accessControlProfile.enableDeviceOs || !!accessControlProfile.devicePolicyId
  aclPayloadObject.devicePolicyId = accessControlProfile.devicePolicyId
  // eslint-disable-next-line max-len
  aclPayloadObject.enableApplications = accessControlProfile.enableApplications || !!accessControlProfile.applicationPolicyId
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
  policyId: string | undefined
) => {
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
  const params = useParams()
  const navigate = useNavigate()
  const { isTemplate } = useConfigTemplate()
  // eslint-disable-next-line max-len
  const tablePath = getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.LIST })
  let linkToInstanceList = usePathBasedOnConfigTemplate(tablePath, '')
  const { editMode } = props

  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const isSwitchMacAclEnabled = useIsSplitOn(Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : enableRbac

  const formRef = useRef<StepsFormLegacyInstance<AccessControlFormFields>>()

  const [ createAclProfile ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddAccessControlProfileMutation,
    useTemplateMutationFn: useAddAccessControlProfileTemplateMutation
  })

  const [ updateAclProfile ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateAccessControlProfileMutation,
    useTemplateMutationFn: useUpdateAccessControlProfileTemplateMutation
  })

  const handleAccessControlPolicy = async (editMode: boolean) => {
    try {
      const aclPayloadObject = genAclPayloadObject(
        formRef.current?.getFieldsValue() as AccessControlFormFields
      )
      if (!editMode) {
        await createAclProfile({
          params: params,
          payload: convertToPayload(false, aclPayloadObject, params.policyId),
          enableRbac: resolvedRbacEnabled
        }).unwrap()
      } else {
        const aclOldPayloadObject = genAclPayloadObject(
          formRef.current?.getFieldValue('oldPayload')
        )
        await updateAclProfile({
          params: params,
          payload: convertToPayload(true, aclPayloadObject, params.policyId),
          oldPayload: convertToPayload(true, aclOldPayloadObject, params.policyId),
          enableRbac: resolvedRbacEnabled
        }).unwrap()
      }

      navigate(linkToInstanceList, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const breadcrumb = usePolicyListBreadcrumb(PolicyType.ACCESS_CONTROL)
  let breadcrumbWithSwitchMacAcl = [...breadcrumb]
  if (isSwitchMacAclEnabled) {
    // Modify the breadcrumb
    if (breadcrumbWithSwitchMacAcl.length >= 3) {
      breadcrumbWithSwitchMacAcl[2] = {
        ...breadcrumbWithSwitchMacAcl[2],
        link: 'policies/accessControl/wifi'
      }
    }

    // Modify the linkToInstanceList to point to wifi path instead of list
    if (typeof linkToInstanceList === 'object' && linkToInstanceList.pathname) {
      linkToInstanceList = {
        ...linkToInstanceList,
        pathname: linkToInstanceList.pathname.replace('/accessControl/list', '/accessControl/wifi')
      }
    }
  }
  const pageTitle = usePolicyPageHeaderTitle(editMode, PolicyType.ACCESS_CONTROL)

  return (
    <>
      <PageHeader
        title={pageTitle}
        breadcrumb={isSwitchMacAclEnabled ? breadcrumbWithSwitchMacAcl : breadcrumb}
      />
      <StepsFormLegacy<AccessControlProfile>
        formRef={formRef}
        editMode={editMode}
        onCancel={() => navigate(linkToInstanceList, { replace: true })}
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
