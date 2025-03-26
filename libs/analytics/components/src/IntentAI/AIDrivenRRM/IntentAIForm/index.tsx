import _           from 'lodash'
import { useIntl } from 'react-intl'

import { StepsForm }              from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { useNavigate }            from '@acx-ui/react-router-dom'

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

import { Introduction }       from './Introduction'
import { IntroductionLegacy } from './IntroductionLegacy'
import { Priority }           from './Priority'
import { Summary }            from './Summary'
import { SummaryLegacy }      from './SummaryLegacy'

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
  const isAIDrivenRRMMetricsEnabled = useIsSplitOn(Features.AI_DRIVEN_RRM_METRICS_TOGGLE)

  const { submit } = useIntentTransition()
  const initialValues = useInitialValues()

  return (<>
    <IntentWizardHeader />
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
        children={isAIDrivenRRMMetricsEnabled ? <Introduction /> : <IntroductionLegacy />}
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
        children={isAIDrivenRRMMetricsEnabled ? <Summary /> : <SummaryLegacy />}
      />
    </StepsForm>
  </>)
}
