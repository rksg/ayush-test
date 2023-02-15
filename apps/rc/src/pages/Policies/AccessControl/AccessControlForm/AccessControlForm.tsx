import { useRef } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  PageHeader, showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import {
  useAddAccessControlProfileMutation,
  useUpdateAccessControlProfileMutation
} from '@acx-ui/rc/services'
import {
  AccessControlInfoType,
  AccessControlProfile,
  getPolicyRoutePath,
  PolicyType,
  PolicyOperation
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import AccessControlSettingForm from './AccessControlSettingForm'


type AccessControlFormProps = {
  editMode: boolean
}

const AccessControlForm = (props: AccessControlFormProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  // eslint-disable-next-line max-len
  const tablePath = getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.LIST })
  const linkToPolicies = useTenantLink(tablePath)
  const { editMode } = props

  const formRef = useRef<StepsFormInstance<AccessControlProfile>>()

  const [ createAclProfile ] = useAddAccessControlProfileMutation()

  const [ updateAclProfile ] = useUpdateAccessControlProfileMutation()

  const convertToPayload = (editMode: boolean) => {
    let payload = {} as AccessControlInfoType
    if (editMode) {
      payload.id = params.policyId ?? ''
    }

    payload.name = formRef.current?.getFieldValue('policyName')
    payload.description = formRef.current?.getFieldValue('description')

    if (formRef.current?.getFieldValue('enableLayer2')) {
      payload.l2AclPolicy = {
        enabled: true,
        id: formRef.current?.getFieldValue('l2AclPolicyId')
      }
    }

    if (formRef.current?.getFieldValue('enableLayer3')) {
      payload.l3AclPolicy = {
        enabled: true,
        id: formRef.current?.getFieldValue('l3AclPolicyId')
      }
    }

    if (formRef.current?.getFieldValue('enableDeviceOs')) {
      payload.devicePolicy = {
        enabled: true,
        id: formRef.current?.getFieldValue('devicePolicyId')
      }
    }

    if (formRef.current?.getFieldValue('enableApplications')) {
      payload.applicationPolicy = {
        enabled: true,
        id: formRef.current?.getFieldValue('applicationPolicyId')
      }
    }

    if (formRef.current?.getFieldValue(['rateLimiting', 'enableDownloadLimit'])
      || formRef.current?.getFieldValue(['rateLimiting', 'enableUploadLimit'])) {
      payload.rateLimiting = {
        enabled: true,
        uplinkLimit: formRef.current?.getFieldValue(['rateLimiting', 'uplinkLimit']) ?? 0,
        downlinkLimit: formRef.current?.getFieldValue(['rateLimiting', 'downlinkLimit']) ?? 0
      }
    }

    return payload
  }

  const handleAccessControlPolicy = async (editMode: boolean) => {
    try {
      if (!editMode) {
        await createAclProfile({
          params: params,
          payload: convertToPayload(false)
        }).unwrap()
      } else {
        await updateAclProfile({
          params: params,
          payload: convertToPayload(true)
        }).unwrap()
      }

      navigate(linkToPolicies, { replace: true })
    } catch(error) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit Access Control Policy' })
          : $t({ defaultMessage: 'Add Access Control Policy' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Access Control' }), link: tablePath }
        ]}
      />
      <StepsForm<AccessControlProfile>
        formRef={formRef}
        onCancel={() => navigate(linkToPolicies, { replace: true })}
        onFinish={() => handleAccessControlPolicy(editMode)}
      >
        <StepsForm.StepForm<AccessControlProfile>
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <AccessControlSettingForm editMode={editMode}/>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export default AccessControlForm
