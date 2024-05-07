import { useReducer } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm
} from '@acx-ui/components'
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
  generatePolicyPageHeaderTitle,
  useConfigTemplate,
  usePolicyPreviousPath,
  useConfigTemplateMutationFnSwitcher
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
  const { isTemplate } = useConfigTemplate()
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SYSLOG)
  const linkToInstanceList = usePolicyPreviousPath(PolicyType.SYSLOG, PolicyOperation.LIST)
  const form = Form.useFormInstance()
  const [state, dispatch] = useReducer(mainReducer, initialValues)

  // eslint-disable-next-line max-len
  const [ createSyslog ] = useConfigTemplateMutationFnSwitcher(useAddSyslogPolicyMutation, useAddSyslogPolicyTemplateMutation)
  // eslint-disable-next-line max-len
  const [ updateSyslog ] = useConfigTemplateMutationFnSwitcher(useUpdateSyslogPolicyMutation, useUpdateSyslogPolicyTemplateMutation)

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
        venues: state.venues
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
      venues: state.venues
    }
  }

  const handleSyslogPolicy = async (edit: boolean) => {
    try {
      if (!edit) {
        await createSyslog({
          params,
          payload: transformPayload(state, false)
        }).unwrap()
      } else {
        await updateSyslog({
          params,
          payload: transformPayload(state, true)
        }).unwrap()
      }
      navigate(linkToInstanceList, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <SyslogContext.Provider value={{ state, dispatch }}>
      <PageHeader
        title={generatePolicyPageHeaderTitle(edit, isTemplate, PolicyType.SYSLOG)}
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
