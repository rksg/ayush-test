import { useReducer } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                                           from '@acx-ui/feature-toggle'
import { useCreateWifiCallingServiceMutation, useCreateWifiCallingServiceTemplateMutation } from '@acx-ui/rc/services'
import {
  CreateNetworkFormFields,
  EPDG,
  useServicePageHeaderTitle,
  QosPriorityEnum,
  ServiceOperation,
  ServiceType, useConfigTemplateMutationFnSwitcher,
  useServiceListBreadcrumb, useServicePreviousPath,
  useConfigTemplate
} from '@acx-ui/rc/utils'
import { useNavigate, useParams } from '@acx-ui/react-router-dom'

import WifiCallingFormContext, { mainReducer } from '../WifiCallingFormContext'
import WifiCallingFormValidate                 from '../WifiCallingFormValidate'
import WifiCallingScopeForm                    from '../WifiCallingScope/WifiCallingScopeForm'
import WifiCallingSummaryForm                  from '../WifiCallingSummary/WifiCallingSummaryForm'

import WifiCallingSettingForm from './WifiCallingSettingForm'


export const WifiCallingForm = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  // eslint-disable-next-line max-len
  const { pathname: previousPath } = useServicePreviousPath(ServiceType.WIFI_CALLING, ServiceOperation.LIST)
  const params = useParams()

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
    epdgs,
    oldNetworkIds: []
  })

  const [ createWifiCallingService ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useCreateWifiCallingServiceMutation,
    useTemplateMutationFn: useCreateWifiCallingServiceTemplateMutation
  })

  const breadcrumb = useServiceListBreadcrumb(ServiceType.WIFI_CALLING)
  const pageTitle = useServicePageHeaderTitle(false, ServiceType.WIFI_CALLING)
  const { isTemplate, saveEnforcementConfig } = useConfigTemplate()
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const isServicePolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const enableRbac = isTemplate ? isConfigTemplateRbacEnabled : isServicePolicyRbacEnabled

  const handleAddWifiCallingService = async () => {
    try {
      const result = await createWifiCallingService({
        params,
        payload: WifiCallingFormValidate(state),
        enableRbac
      }).unwrap()

      if (result.response?.id) {
        await saveEnforcementConfig(result.response.id)
      }

      navigate(previousPath, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <WifiCallingFormContext.Provider value={{ state, dispatch }}>
      <PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb}
      />
      <StepsForm<CreateNetworkFormFields>
        form={form}
        onCancel={() => navigate(previousPath, { replace: true })}
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
