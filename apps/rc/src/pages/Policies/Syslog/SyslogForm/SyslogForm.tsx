import { useReducer } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm
} from '@acx-ui/components'
import { useAddSyslogPolicyMutation, useUpdateSyslogPolicyMutation } from '@acx-ui/rc/services'
import {
  PolicyType,
  PolicyOperation,
  getPolicyRoutePath,
  FacilityEnum,
  FlowLevelEnum,
  PriorityEnum,
  ProtocolEnum,
  SyslogVenue,
  SyslogContextType,
  getPolicyListRoutePath
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import SyslogContext , { mainReducer } from '../SyslogContext'
import SyslogScopeForm                 from '../SyslogScope/SyslogScopeForm'
import SyslogSummaryForm               from '../SyslogSummary/SyslogSummaryForm'

import SyslogSettingForm from './SyslogSettingForm'

type SyslogFormProps = {
  edit: boolean
}

const SyslogForm = (props: SyslogFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tablePath = getPolicyRoutePath(
    { type: PolicyType.SYSLOG, oper: PolicyOperation.LIST })
  const linkToPolicies = useTenantLink(tablePath)
  const params = useParams()
  const { edit } = props

  const policyName = ''
  const server = ''
  const port = 514
  const protocol = ProtocolEnum.UDP
  const secondaryServer = ''
  const secondaryPort = 514
  const secondaryProtocol = ProtocolEnum.TCP
  const facility = FacilityEnum.KEEP_ORIGINAL
  const priority = PriorityEnum.INFO
  const flowLevel = FlowLevelEnum.CLIENT_FLOW
  const venues:SyslogVenue[] = []

  const form = Form.useFormInstance()
  const [state, dispatch] = useReducer(mainReducer, {
    policyName,
    server,
    port,
    protocol,
    secondaryServer,
    secondaryPort,
    secondaryProtocol,
    facility,
    priority,
    flowLevel,
    venues
  })

  const [ createSyslog ] = useAddSyslogPolicyMutation()

  const [ updateSyslog ] = useUpdateSyslogPolicyMutation()

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
      navigate(linkToPolicies, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <SyslogContext.Provider value={{ state, dispatch }}>
      <PageHeader
        title={edit
          ? $t({ defaultMessage: 'Edit Syslog Server' })
          : $t({ defaultMessage: 'Add Syslog Server' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          {
            text: $t({ defaultMessage: 'Syslog Server' }),
            link: tablePath
          }
        ]}
      />
      <StepsForm<SyslogContextType>
        form={form}
        editMode={edit}
        onCancel={() => navigate(linkToPolicies)}
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

export default SyslogForm
