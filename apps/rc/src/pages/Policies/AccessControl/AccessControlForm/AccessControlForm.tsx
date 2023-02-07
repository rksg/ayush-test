import { useRef } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import {
  AccessControlProfile,
  getPolicyRoutePath,
  PolicyType,
  PolicyOperation
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import AccessControlSettingForm from './AccessControlSettingForm'

type AccessControlFormProps = {
  edit: boolean
}

const AccessControlForm = (props: AccessControlFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  // eslint-disable-next-line max-len
  const tablePath = getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.LIST })
  const linkToPolicies = useTenantLink(tablePath)
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
          { text: $t({ defaultMessage: 'Access Control' }), link: tablePath }
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
