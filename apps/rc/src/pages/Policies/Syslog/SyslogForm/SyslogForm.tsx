import { useRef, useReducer } from 'react'

import { FormattedList, useIntl } from 'react-intl'

import {
  PageHeader, showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useAddSyslogPolicyMutation, useUpdateSyslogPolicyMutation } from '@acx-ui/rc/services'
import {
  CatchErrorResponse,
  PolicyType,
  PolicyOperation,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  FacilityEnum,
  FlowLevelEnum,
  PriorityEnum,
  ProtocolEnum,
  SyslogVenue,
  SyslogContextType
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
  const linkToPolicies = useTenantLink(getPolicyListRoutePath())
  const params = useParams()
  const { edit } = props

  const policyName = ''
  const server = ''
  const port = ''
  const protocol = ProtocolEnum.UDP
  const secondaryServer = ''
  const secondaryPort = ''
  const secondaryProtocol = ProtocolEnum.TCP
  const facility = FacilityEnum.KEEP_ORIGINAL
  const priority = PriorityEnum.INFO
  const flowLevel = FlowLevelEnum.CLIENT_FLOW
  const venues:SyslogVenue[] = []

  const formRef = useRef<StepsFormInstance<SyslogContextType>>()
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
    } catch(error) {
      const errorResponse = error as CatchErrorResponse
      showToast({
        type: 'error',
        content: (<div>
          <p style={{ textAlign: 'left' }}>{$t({ defaultMessage: 'An error occurred' })}</p>
          <FormattedList value={errorResponse.data.errors.map(error => error.message)} />
        </div>)
      })
    }
  }

  return (
    <SyslogContext.Provider value={{ state, dispatch }}>
      <PageHeader
        title={edit
          ? $t({ defaultMessage: 'Edit Syslog Server' })
          : $t({ defaultMessage: 'Add Syslog Server' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Syslog' }),
            link: getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.LIST }) }
        ]}
      />
      <StepsForm<SyslogContextType>
        formRef={formRef}
        editMode={edit}
        onCancel={() => navigate(linkToPolicies)}
        onFinish={() => handleSyslogPolicy(edit)}
      >
        <StepsForm.StepForm<SyslogContextType>
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <SyslogSettingForm edit={edit} formRef={formRef}/>
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
