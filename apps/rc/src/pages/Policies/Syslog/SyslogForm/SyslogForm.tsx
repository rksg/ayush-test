import { useRef, useReducer } from 'react'

import { FormattedList, useIntl } from 'react-intl'

import {
  PageHeader, showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useAddSyslogPolicyMutation, useUpdateSyslogPolicyMutation } from '@acx-ui/rc/services'
import {
  catchErrorResponse,
  getPolicyListRoutePath,
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
  const protocol = 'UDP'
  const secondaryServer = ''
  const secondaryPort = ''
  const secondaryProtocol = 'TCP'
  const facility = ''
  const priority = ''
  const flowLevel = ''
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
    return {
      id: edit ? params.policyId : '',
      name: state.policyName
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
      const errorResponse = error as catchErrorResponse
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
          ? $t({ defaultMessage: 'Edit Syslog Policy' })
          : $t({ defaultMessage: 'Add Syslog Server' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Policies' }), link: getPolicyListRoutePath() }
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
