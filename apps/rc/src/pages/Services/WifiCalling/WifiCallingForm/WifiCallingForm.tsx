import { useRef, useReducer } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader, showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useCreateWifiCallingServiceMutation }            from '@acx-ui/rc/services'
import { CreateNetworkFormFields, EPDG, QosPriorityEnum } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }          from '@acx-ui/react-router-dom'

import WifiCallingFormContext, { mainReducer } from '../WifiCallingFormContext'
import WifiCallingFormValidate                 from '../WifiCallingFormValidate'
import WifiCallingScopeForm                    from '../WifiCallingScope/WifiCallingScopeForm'
import WifiCallingSummaryForm                  from '../WifiCallingSummary/WifiCallingSummaryForm'

import WifiCallingSettingForm from './WifiCallingSettingForm'


const WifiCallingForm = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
  const params = useParams()

  const serviceName = ''
  const description = ''
  const qosPriority:QosPriorityEnum = QosPriorityEnum.WIFICALLING_PRI_VOICE
  const tags:string[] = []
  const ePDG:EPDG[] = []
  const networkIds:string[] = []
  const networksName:string[] = []

  const formRef = useRef<StepsFormInstance<CreateNetworkFormFields>>()
  const [state, dispatch] = useReducer(mainReducer, {
    serviceName,
    ePDG,
    qosPriority,
    tags,
    description,
    networkIds,
    networksName
  })

  const [ createWifiCallingService ] = useCreateWifiCallingServiceMutation()

  const handleAddWifiCallingService = async () => {
    try {
      await createWifiCallingService({
        params,
        payload: WifiCallingFormValidate(state)
      }).unwrap()
      navigate(linkToServices, { replace: true })
    } catch(error) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <WifiCallingFormContext.Provider value={{ state, dispatch }}>
      <PageHeader
        title={$t({ defaultMessage: 'Add Wi-Fi Calling Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />
      <StepsForm<CreateNetworkFormFields>
        formRef={formRef}
        onCancel={() => navigate(linkToServices)}
        onFinish={handleAddWifiCallingService}
      >
        <StepsForm.StepForm<CreateNetworkFormFields>
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <WifiCallingSettingForm />
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='scope'
          title={$t({ defaultMessage: 'Scope' })}
        >
          <WifiCallingScopeForm />
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='summary'
          title={$t({ defaultMessage: 'Summary' })}
        >
          <WifiCallingSummaryForm />
        </StepsForm.StepForm>
      </StepsForm>
    </WifiCallingFormContext.Provider>
  )
}

export default WifiCallingForm
