import { useRef } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn }         from '@acx-ui/feature-toggle'
import {
  useAddAccessControlProfileMutation,
  useUpdateAccessControlProfileMutation
} from '@acx-ui/rc/services'
import {
  AccessControlInfoType,
  AccessControlProfile,
  getPolicyRoutePath,
  PolicyType,
  PolicyOperation, AccessControlFormFields, getPolicyListRoutePath
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import AccessControlSettingForm from './AccessControlSettingForm'


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

const AccessControlForm = (props: AccessControlFormProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  // eslint-disable-next-line max-len
  const tablePath = getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.LIST })
  const linkToPolicies = useTenantLink(tablePath)
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const { editMode } = props

  const formRef = useRef<StepsFormLegacyInstance<AccessControlFormFields>>()

  const [ createAclProfile ] = useAddAccessControlProfileMutation()

  const [ updateAclProfile ] = useUpdateAccessControlProfileMutation()

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

      navigate(linkToPolicies, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit Access Control Policy' })
          : $t({ defaultMessage: 'Add Access Control Policy' })}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          { text: $t({ defaultMessage: 'Access Control' }), link: tablePath }
        ] : [
          { text: $t({ defaultMessage: 'Access Control' }), link: tablePath }
        ]}
      />
      <StepsFormLegacy<AccessControlProfile>
        formRef={formRef}
        onCancel={() => navigate(linkToPolicies, { replace: true })}
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

export default AccessControlForm
