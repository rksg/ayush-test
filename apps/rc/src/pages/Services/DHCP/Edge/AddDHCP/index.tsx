import { useRef } from 'react'

import { useIntl } from 'react-intl'

import {
  Loader,
  PageHeader, showToast, StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import {
  EdgeDhcpSettingForm
} from '@acx-ui/rc/components'
import { useAddEdgeDhcpServiceMutation } from '@acx-ui/rc/services'
import { EdgeDhcpSetting }               from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }    from '@acx-ui/react-router-dom'

const AddDhcp = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
  const formRef = useRef<StepsFormInstance<EdgeDhcpSetting>>()
  const [addEdgeDhcp, { isLoading: isFormSubmitting }] = useAddEdgeDhcpServiceMutation()

  const handleAddEdgeDhcp = async (data: EdgeDhcpSetting) => {
    try {
      const payload = { ...data }
      await addEdgeDhcp({ payload: payload }).unwrap()
      navigate(linkToServices, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add DHCP for SmartEdge Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />
      <Loader states={[{ isLoading: false, isFetching: isFormSubmitting }]}>
        <StepsForm
          formRef={formRef}
          onFinish={handleAddEdgeDhcp}
          onCancel={() => navigate(linkToServices)}
          buttonLabel={{ submit: $t({ defaultMessage: 'Add' }) }}
        >
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Loader>
    </>
  )
}

export default AddDhcp
