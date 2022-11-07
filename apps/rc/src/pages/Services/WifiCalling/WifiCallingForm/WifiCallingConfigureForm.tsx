import { useRef, useReducer } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader, showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useUpdateWifiCallingServiceMutation } from '@acx-ui/rc/services'
import {
  CreateNetworkFormFields,
  EPDG,
  QosPriorityEnum
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'


import WifiCallingFormContext, { mainReducer } from '../WifiCallingFormContext'
import WifiCallingFormValidate                 from '../WifiCallingFormValidate'
import WifiCallingScopeForm                    from '../WifiCallingScope/WifiCallingScopeForm'

import WifiCallingSettingForm from './WifiCallingSettingForm'

const WifiCallingConfigureForm = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
  const params = useParams()

  const [ updateWifiCallingService ] = useUpdateWifiCallingServiceMutation()

  const initServiceName = ''
  const initDescription = ''

  const serviceName = initServiceName
  const description = initDescription
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

  const handleUpdateWifiCallingService = async () => {
    try {
      await updateWifiCallingService({
        params,
        payload: WifiCallingFormValidate(state)
      }).unwrap()
      navigate(linkToServices, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <WifiCallingFormContext.Provider value={{ state, dispatch }}>
      <PageHeader
        title={$t({ defaultMessage: 'Configure Wi-Fi Calling Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />
      <StepsForm<CreateNetworkFormFields>
        formRef={formRef}
        onCancel={() => navigate(linkToServices)}
        onFinish={handleUpdateWifiCallingService}
      >
        <StepsForm.StepForm<CreateNetworkFormFields>
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <WifiCallingSettingForm edit={true} formRef={formRef} />
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='scope'
          title={$t({ defaultMessage: 'Scope' })}
        >
          <WifiCallingScopeForm edit={true} />
        </StepsForm.StepForm>

      </StepsForm>
    </WifiCallingFormContext.Provider>
  )
}

export default WifiCallingConfigureForm
