import { useReducer } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm
} from '@acx-ui/components'
import { useUpdateWifiCallingServiceMutation }     from '@acx-ui/rc/services'
import {
  CreateNetworkFormFields,
  EPDG, getServiceListRoutePath, getServiceRoutePath,
  QosPriorityEnum, ServiceOperation, ServiceType
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import WifiCallingFormContext, { mainReducer } from '../WifiCallingFormContext'
import WifiCallingFormValidate                 from '../WifiCallingFormValidate'
import WifiCallingScopeForm                    from '../WifiCallingScope/WifiCallingScopeForm'

import WifiCallingSettingForm from './WifiCallingSettingForm'

const WifiCallingConfigureForm = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tablePath = getServiceRoutePath({
    type: ServiceType.WIFI_CALLING,
    oper: ServiceOperation.LIST
  })
  const linkToServices = useTenantLink(tablePath)
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

  const handleUpdateWifiCallingService = async () => {
    try {
      await updateWifiCallingService({
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
        title={$t({ defaultMessage: 'Configure Wi-Fi Calling Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'Wi-Fi Calling' }), link: tablePath }
        ]}
      />
      <StepsForm<CreateNetworkFormFields>
        form={form}
        editMode={true}
        onCancel={() => navigate(linkToServices)}
        onFinish={handleUpdateWifiCallingService}
      >
        <StepsForm.StepForm<CreateNetworkFormFields>
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <WifiCallingSettingForm edit={true} />
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
