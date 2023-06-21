import { useReducer } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm
} from '@acx-ui/components'
import { Features, useIsSplitOn }              from '@acx-ui/feature-toggle'
import { useCreateWifiCallingServiceMutation } from '@acx-ui/rc/services'
import {
  CreateNetworkFormFields,
  EPDG,
  getServiceListRoutePath,
  getServiceRoutePath,
  QosPriorityEnum,
  ServiceOperation,
  ServiceType } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import WifiCallingFormContext, { mainReducer } from '../WifiCallingFormContext'
import WifiCallingFormValidate                 from '../WifiCallingFormValidate'
import WifiCallingScopeForm                    from '../WifiCallingScope/WifiCallingScopeForm'
import WifiCallingSummaryForm                  from '../WifiCallingSummary/WifiCallingSummaryForm'

import WifiCallingSettingForm from './WifiCallingSettingForm'


const WifiCallingForm = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tablePath = getServiceRoutePath({
    type: ServiceType.WIFI_CALLING,
    oper: ServiceOperation.LIST
  })
  const linkToServices = useTenantLink(tablePath)
  const params = useParams()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const serviceName = ''
  const description = ''
  const qosPriority:QosPriorityEnum = QosPriorityEnum.WIFICALLING_PRI_VOICE
  const tags:string[] = []
  const ePDG:EPDG[] = []
  const networkIds:string[] = []
  const networksName:string[] = []
  const epdgs:EPDG[] = []

  const form = Form.useFormInstance()
  const [state, dispatch] = useReducer(mainReducer, {
    serviceName,
    ePDG,
    qosPriority,
    tags,
    description,
    networkIds,
    networksName,
    epdgs
  })

  const [ createWifiCallingService ] = useCreateWifiCallingServiceMutation()

  const handleAddWifiCallingService = async () => {
    try {
      await createWifiCallingService({
        params,
        payload: WifiCallingFormValidate(state)
      }).unwrap()
      navigate(linkToServices, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <WifiCallingFormContext.Provider value={{ state, dispatch }}>
      <PageHeader
        title={$t({ defaultMessage: 'Add Wi-Fi Calling Service' })}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'Wi-Fi Calling' }),
            link: tablePath
          }
        ] : [
          {
            text: $t({ defaultMessage: 'Services' }),
            link: tablePath
          }
        ]}
      />
      <StepsForm<CreateNetworkFormFields>
        form={form}
        onCancel={() => navigate(linkToServices, { replace: true })}
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
