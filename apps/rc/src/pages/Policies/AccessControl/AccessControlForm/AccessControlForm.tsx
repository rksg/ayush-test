import { useRef } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { AccessControlProfile, getPolicyListRoutePath } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                   from '@acx-ui/react-router-dom'

import AccessControlSettingForm from './AccessControlSettingForm'

type AccessControlFormProps = {
  edit: boolean
}

const AccessControlForm = (props: AccessControlFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToPolicies = useTenantLink(getPolicyListRoutePath(true))
  const { edit } = props

  const formRef = useRef<StepsFormInstance<AccessControlProfile>>()

  // const handleAccessControlPolicy = async (isEdit: boolean) => {
  //   try {
  //     navigate(linkToPolicies, { replace: true })
  //   } catch(error) {
  //     showToast({
  //       type: 'error',
  //       content: $t({ defaultMessage: 'An error occurred' })
  //     })
  //   }
  // }

  return (
    <>
      <PageHeader
        title={edit
          ? $t({ defaultMessage: 'Edit Access Control Policy' })
          : $t({ defaultMessage: 'Add Access Control Policy' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Policies' }), link: getPolicyListRoutePath() }
        ]}
      />
      <StepsForm<AccessControlProfile>
        formRef={formRef}
        onCancel={() => navigate(linkToPolicies)}
        // onFinish={() => handleAccessControlPolicy(edit)}
      >
        <StepsForm.StepForm<AccessControlProfile>
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <AccessControlSettingForm />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export default AccessControlForm
