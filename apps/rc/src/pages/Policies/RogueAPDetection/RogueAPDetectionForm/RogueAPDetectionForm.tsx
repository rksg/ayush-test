import { useRef, useReducer } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader, showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useAddRoguePolicyMutation, useUpdateRoguePolicyMutation } from '@acx-ui/rc/services'
import {
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
  const linkToPolicies = useTenantLink('/policies')
  const params = useParams()
  const { edit } = props

  const policyName = ''
  const description = '--'
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
      description: '',
      rules: state.rules,
      venues: state.venues
    }
  }

  const handleAddRogueAPDetectionPolicy = async () => {
    try {
      await createRoguePolicy({
        params,
        payload: transformPayload(state, false)
      }).unwrap()
      navigate(linkToPolicies, { replace: true })
    } catch(error) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const handleUpdateRogueAPDetectionPolicy = async () => {
    try {
      await updateRoguePolicy({
        params,
        payload: transformPayload(state, true)
      }).unwrap()
      navigate(linkToPolicies, { replace: true })
    } catch(error) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
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
          { text: $t({ defaultMessage: 'Policies' }), link: '/policies' }
        ]}
      />
      <StepsForm<RogueAPDetectionContextType>
        formRef={formRef}
        onCancel={() => navigate(linkToPolicies)}
        onFinish={edit
          ? handleUpdateRogueAPDetectionPolicy
          : handleAddRogueAPDetectionPolicy
        }
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
