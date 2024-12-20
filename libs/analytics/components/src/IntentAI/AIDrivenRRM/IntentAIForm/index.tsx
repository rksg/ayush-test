import { useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { StepsForm }   from '@acx-ui/components'
import { useNavigate } from '@acx-ui/react-router-dom'

import { IntentWizardHeader } from '../../common/IntentWizardHeader'
import { getScheduledAt }     from '../../common/ScheduleTiming'
import { SettingsPage }       from '../../common/SettingsPage'
import { useIntentContext }   from '../../IntentContext'
import { Statuses }           from '../../states'
import {
  createUseIntentTransition,
  FormValues,
  IntentTransitionPayload,
  useInitialValues
} from '../../useIntentTransition'
import { SliderGraphAfter, SliderGraphBefore, SummaryGraphAfter, SummaryGraphBefore } from '../RRMGraph'
import { useIntentAICRRMQuery }                                                       from '../RRMGraph/services'

import { Introduction } from './Introduction'
import { Priority }     from './Priority'
import { Summary }      from './Summary'

type CRRMFormValues = FormValues<{ crrmFullOptimization: boolean }>
type CRRMPayload = IntentTransitionPayload<Exclude<CRRMFormValues['preferences'], undefined>>

function getFormDTO (values: CRRMFormValues): CRRMPayload {
  return {
    id: values.id,
    status: values.status === Statuses.new ? Statuses.scheduled : values.status,
    statusReason: values.status === Statuses.new ? undefined : values.statusReason,
    metadata: {
      ..._.pick(values, ['preferences']),
      scheduledAt: getScheduledAt(values).utc().toISOString()
    }
  }
}

const useIntentTransition = createUseIntentTransition(getFormDTO)

export function IntentAIForm () {
  const { intent } = useIntentContext()
  const { $t } = useIntl()
  const navigate = useNavigate()

  const queryResult = useIntentAICRRMQuery()
  const crrmData = queryResult.data!
  const [sliderUrlBefore, setSliderUrlBefore] = useState<string>('')
  const [sliderUrlAfter, setSliderUrlAfter] = useState<string>('')

  const { submit } = useIntentTransition()
  const initialValues = useInitialValues()

  return (<>
    <IntentWizardHeader />
    {/* hide the graph, only rendering the graph image for the slider & summary */}
    {crrmData && <div hidden data-testid='hidden-graph'>
      <SliderGraphBefore crrmData={crrmData} setUrl={setSliderUrlBefore} />
      <SliderGraphAfter crrmData={crrmData} setUrl={setSliderUrlAfter} />
    </div>}
    <StepsForm
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
      initialValues={{
        ...initialValues,
        preferences: _.get(intent, ['metadata','preferences']) || { crrmFullOptimization: true }
      }}
      onCancel={() => { navigate(-1) }}
      onFinish={async (values) => { submit(values) }}
    >
      <StepsForm.StepForm
        title={$t({ defaultMessage: 'Introduction' })}
        children={<Introduction
          sliderUrlBefore={sliderUrlBefore}
          sliderUrlAfter={sliderUrlAfter}
          queryResult={queryResult}
        />}
      />
      <StepsForm.StepForm
        title={$t({ defaultMessage: 'Intent Priority' })}
        children={<Priority />}
      />
      <StepsForm.StepForm
        title={$t({ defaultMessage: 'Settings' })}
        children={<SettingsPage />}
      />
      <StepsForm.StepForm
        title={$t({ defaultMessage: 'Summary' })}
        children={<Summary />}
      />
    </StepsForm>
  </>)
}
