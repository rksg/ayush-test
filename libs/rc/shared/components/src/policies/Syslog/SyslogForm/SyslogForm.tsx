import { useReducer } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                        from '@acx-ui/feature-toggle'
import {
  useAddSyslogPolicyMutation, useAddSyslogPolicyTemplateMutation,
  useUpdateSyslogPolicyMutation, useUpdateSyslogPolicyTemplateMutation
} from '@acx-ui/rc/services'
import {
  PolicyType,
  PolicyOperation,
  FacilityEnum,
  FlowLevelEnum,
  PriorityEnum,
  ProtocolEnum,
  SyslogContextType,
  usePolicyListBreadcrumb,
  usePolicyPageHeaderTitle,
  usePolicyPreviousPath,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplate,
  useAfterPolicySaveRedirectPath
} from '@acx-ui/rc/utils'
import { useNavigate, useParams } from '@acx-ui/react-router-dom'

import SyslogContext , { mainReducer } from '../SyslogContext'
import SyslogScopeForm                 from '../SyslogScope/SyslogScopeForm'
import SyslogSummaryForm               from '../SyslogSummary/SyslogSummaryForm'

import SyslogSettingForm from './SyslogSettingForm'

type SyslogFormProps = {
  edit: boolean
}

const initialValues = {
  policyName: '',
  server: '',
  port: 514,
  protocol: ProtocolEnum.UDP,
  secondaryServer: '',
  secondaryPort: 514,
  secondaryProtocol: ProtocolEnum.TCP,
  facility: FacilityEnum.KEEP_ORIGINAL,
  priority: PriorityEnum.INFO,
  flowLevel: FlowLevelEnum.CLIENT_FLOW,
  venues: []
}

export const SyslogForm = (props: SyslogFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const { edit } = props
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SYSLOG)
  const pageTitle = usePolicyPageHeaderTitle(edit, PolicyType.SYSLOG)
  const linkToInstanceList = usePolicyPreviousPath(PolicyType.SYSLOG, PolicyOperation.LIST)
  const redirectPathAfterSave = useAfterPolicySaveRedirectPath(PolicyType.SYSLOG)
  const form = Form.useFormInstance()
  const { isTemplate } = useConfigTemplate()
  const [state, dispatch] = useReducer(mainReducer, initialValues)
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedEnableRbac = isTemplate ? enableTemplateRbac : enableRbac

  const [ createSyslog ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddSyslogPolicyMutation,
    useTemplateMutationFn: useAddSyslogPolicyTemplateMutation
  })
  const [ updateSyslog ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateSyslogPolicyMutation,
    useTemplateMutationFn: useUpdateSyslogPolicyTemplateMutation
  })

  const transformPayload = (state: SyslogContextType, edit: boolean) => {
    if (!(state.secondaryServer && state.secondaryPort)) {
      return {
        id: edit ? params.policyId : '',
        name: state.policyName,
        primary: {
          server: state.server,
          port: state.port,
          protocol: state.protocol
        },
        facility: state.facility,
        flowLevel: state.flowLevel,
        venues: state.venues,
        oldVenues: state.oldVenues
      }
    }

    return {
      id: edit ? params.policyId : '',
      name: state.policyName,
      primary: {
        server: state.server,
        port: state.port,
        protocol: state.protocol
      },
      secondary: {
        server: state.secondaryServer,
        port: state.secondaryPort,
        protocol: state.secondaryProtocol
      },
      facility: state.facility,
      flowLevel: state.flowLevel,
      venues: state.venues,
      oldVenues: state.oldVenues
    }
  }

  const handleSyslogPolicy = async (edit: boolean) => {
    try {
      if (!edit) {
        await createSyslog({
          params,
          payload: transformPayload(state, false),
          enableRbac: resolvedEnableRbac
        }).unwrap()
      } else {
        await updateSyslog({
          params,
          payload: transformPayload(state, true),
          enableRbac: resolvedEnableRbac
        }).unwrap()
      }
      navigate(redirectPathAfterSave, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <SyslogContext.Provider value={{ state, dispatch }}>
      <PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb}
      />
      <StepsForm<SyslogContextType>
        form={form}
        editMode={edit}
        onCancel={() => navigate(linkToInstanceList)}
        onFinish={() => handleSyslogPolicy(edit)}
      >
        <StepsForm.StepForm<SyslogContextType>
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <SyslogSettingForm edit={edit}/>
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='scope'
          title={$t({ defaultMessage: 'Scope' })}
        >
          <SyslogScopeForm />
        </StepsForm.StepForm>

        { !edit && <StepsForm.StepForm
          name='summary'
          title={$t({ defaultMessage: 'Summary' })}
        >
          <SyslogSummaryForm />
        </StepsForm.StepForm> }
      </StepsForm>
    </SyslogContext.Provider>
  )
}
