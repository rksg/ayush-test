import { useRef } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader, showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { AccessControlProfile }                  from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import AccessControlSettingForm from './AccessControlSettingForm'

type AccessControlFormProps = {
  edit: boolean
}

const AccessControlForm = (props: AccessControlFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToPolicies = useTenantLink('/policies')
  const params = useParams()
  const { edit } = props

  const formRef = useRef<StepsFormInstance<AccessControlProfile>>()

  const handleAddAccessControlPolicy = async () => {
    try {
      console.log('add access control')
      navigate(linkToPolicies, { replace: true })
    } catch(error) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const handleUpdateAccessControlPolicy = async () => {
    try {
      console.log('update access control')
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
        title={edit
          ? $t({ defaultMessage: 'Edit Access Control Policy' })
          : $t({ defaultMessage: 'Add Access Control Policy' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Policies' }), link: '/policies' }
        ]}
      />
      <StepsForm<AccessControlProfile>
        formRef={formRef}
        onCancel={() => navigate(linkToPolicies)}
        onFinish={edit
          ? handleUpdateAccessControlPolicy
          : handleAddAccessControlPolicy
        }
      >
        <StepsForm.StepForm<AccessControlProfile>
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <AccessControlSettingForm />
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='scope'
          title={$t({ defaultMessage: 'Scope' })}
        >
          access control scope
        </StepsForm.StepForm>

        { !edit && <StepsForm.StepForm
          name='summary'
          title={$t({ defaultMessage: 'Summary' })}
        >
          access control summary
        </StepsForm.StepForm> }
      </StepsForm>
    </>
  )
}

export default AccessControlForm
