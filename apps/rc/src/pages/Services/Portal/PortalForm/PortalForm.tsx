import { useRef, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader, showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useCreatePortalServiceMutation }        from '@acx-ui/rc/services'
import { Portal }                                from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import PortalScopeForm       from '../PortalScope/PortalScopeForm'
import { PortalSummaryForm } from '../PortalSummary/PortalSummaryForm'

import PortalSettingForm from './PortalSettingForm'



const PortalForm = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
  const params = useParams()

  const [portalData, setPortalData]=useState<Portal>()
  const formRef = useRef<StepsFormInstance<Portal>>()

  const [ createPortalService ] = useCreatePortalServiceMutation()

  const handleAddPortalService = async (data : Portal) => {
    try {
      await createPortalService({ params, payload: data }).unwrap()
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
        title={$t({ defaultMessage: 'Add Portal Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Service' }), link: '/service' }
        ]}
      />
      <StepsForm<Portal>
        formRef={formRef}
        onCancel={() => navigate(linkToServices)}
        onFinish={(data) => handleAddPortalService(data)}
      >
        <StepsForm.StepForm
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
          onFinish={async (data) => {
            setPortalData({ ...portalData, ...data })
            return true
          }}
        >
          <PortalSettingForm />
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='scope'
          title={$t({ defaultMessage: 'Scope' })}
          onFinish={async (data) => {
            setPortalData({ ...portalData, ...data })
            return true
          }}
        >
          <PortalScopeForm />
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='summary'
          title={$t({ defaultMessage: 'Summary' })}
        >
          <PortalSummaryForm summaryData={portalData}/>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export default PortalForm
