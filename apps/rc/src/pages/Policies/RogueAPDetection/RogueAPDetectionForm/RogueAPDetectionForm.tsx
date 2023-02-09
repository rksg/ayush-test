import { useRef, useReducer } from 'react'

import { FormattedList, useIntl } from 'react-intl'

import {
  PageHeader, showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useAddRoguePolicyMutation, useUpdateRoguePolicyMutation } from '@acx-ui/rc/services'
import {
  CatchErrorResponse,
  getPolicyListRoutePath,
  RogueAPDetectionContextType,
  RogueAPRule,
  RogueVenue
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import RogueAPDetectionContext , { mainReducer } from '../RogueAPDetectionContext'
import RogueAPDetectionScopeForm                 from '../RogueAPDetectionScope/RogueAPDetectionScopeForm'
import RogueAPDetectionSummaryForm               from '../RogueAPDetectionSummary/RogueAPDetectionSummaryForm'

import RogueAPDetectionSettingForm from './RogueAPDetectionSettingForm'

type RogueAPDetectionFormProps = {
  edit: boolean
}

const RogueAPDetectionForm = (props: RogueAPDetectionFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToPolicies = useTenantLink(getPolicyListRoutePath())
  const params = useParams()
  const { edit } = props

  const policyName = ''
  const description = ''
  const tags:string[] = []
  const rules:RogueAPRule[] = []
  const venues:RogueVenue[] = []

  const formRef = useRef<StepsFormInstance<RogueAPDetectionContextType>>()
  const [state, dispatch] = useReducer(mainReducer, {
    policyName,
    tags,
    description,
    rules,
    venues
  })

  const [ createRoguePolicy ] = useAddRoguePolicyMutation()

  const [ updateRoguePolicy ] = useUpdateRoguePolicyMutation()

  const transformPayload = (state: RogueAPDetectionContextType, edit: boolean) => {
    return {
      id: edit ? params.policyId : '',
      name: state.policyName,
      description: state.description,
      rules: state.rules,
      venues: state.venues
    }
  }

  const handleRogueAPDetectionPolicy = async (edit: boolean) => {
    try {
      if (!edit) {
        await createRoguePolicy({
          params,
          payload: transformPayload(state, false)
        }).unwrap()
      } else {
        await updateRoguePolicy({
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
    <RogueAPDetectionContext.Provider value={{ state, dispatch }}>
      <PageHeader
        title={edit
          ? $t({ defaultMessage: 'Edit Rogue AP Detection Policy' })
          : $t({ defaultMessage: 'Add Rogue AP Detection Policy' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Policies' }), link: getPolicyListRoutePath() }
        ]}
      />
      <StepsForm<RogueAPDetectionContextType>
        formRef={formRef}
        editMode={edit}
        onCancel={() => navigate(linkToPolicies, { replace: true })}
        onFinish={() => handleRogueAPDetectionPolicy(edit)}
      >
        <StepsForm.StepForm<RogueAPDetectionContextType>
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <RogueAPDetectionSettingForm edit={edit} formRef={formRef}/>
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='scope'
          title={$t({ defaultMessage: 'Scope' })}
        >
          <RogueAPDetectionScopeForm />
        </StepsForm.StepForm>

        { !edit && <StepsForm.StepForm
          name='summary'
          title={$t({ defaultMessage: 'Summary' })}
        >
          <RogueAPDetectionSummaryForm />
        </StepsForm.StepForm> }
      </StepsForm>
    </RogueAPDetectionContext.Provider>
  )
}

export default RogueAPDetectionForm
