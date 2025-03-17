import { useReducer } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                                           from '@acx-ui/feature-toggle'
import { useUpdateWifiCallingServiceMutation, useUpdateWifiCallingServiceTemplateMutation } from '@acx-ui/rc/services'
import {
  CreateNetworkFormFields,
  EPDG, useServicePageHeaderTitle,
  QosPriorityEnum, ServiceOperation, ServiceType,
  useConfigTemplateMutationFnSwitcher,
  useServiceListBreadcrumb, useServicePreviousPath,
  useConfigTemplate
} from '@acx-ui/rc/utils'
import { useNavigate, useParams } from '@acx-ui/react-router-dom'

import { useEnforcedStatus }                   from '../../../configTemplates'
import WifiCallingFormContext, { mainReducer } from '../WifiCallingFormContext'
import WifiCallingFormValidate                 from '../WifiCallingFormValidate'
import WifiCallingScopeForm                    from '../WifiCallingScope/WifiCallingScopeForm'

import WifiCallingSettingForm from './WifiCallingSettingForm'

export const WifiCallingConfigureForm = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  // eslint-disable-next-line max-len
  const { pathname: previousPath } = useServicePreviousPath(ServiceType.WIFI_CALLING, ServiceOperation.LIST)
  const params = useParams()
  const { isTemplate, saveEnforcementConfig } = useConfigTemplate()
  const { getEnforcedStepsFormProps } = useEnforcedStatus()
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const isServicePolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const enableRbac = isTemplate ? isConfigTemplateRbacEnabled : isServicePolicyRbacEnabled

  const [ updateWifiCallingService ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateWifiCallingServiceMutation,
    useTemplateMutationFn: useUpdateWifiCallingServiceTemplateMutation
  })

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
  const oldNetworkIds: string[] = []

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
    oldNetworkIds,
    isEnforced: false
  })

  const breadcrumb = useServiceListBreadcrumb(ServiceType.WIFI_CALLING)
  const pageTitle = useServicePageHeaderTitle(true, ServiceType.WIFI_CALLING)

  const handleUpdateWifiCallingService = async () => {
    try {
      await updateWifiCallingService({
        params,
        payload: WifiCallingFormValidate(state),
        enableRbac
      }).unwrap()

      if (params?.serviceId) {
        await saveEnforcementConfig(params.serviceId)
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
        editMode={true}
        onCancel={() => navigate(previousPath)}
        onFinish={handleUpdateWifiCallingService}
        {...getEnforcedStepsFormProps('StepsForm', state.isEnforced)}
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
