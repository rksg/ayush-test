import React from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { StepsForm }   from '@acx-ui/components'
import { useNavigate } from '@acx-ui/react-router-dom'
import { NetworkNode } from '@acx-ui/utils'

import { IntentWizardHeader }                                                               from '../../common/IntentWizardHeader'
import { getScheduledAt }                                                                   from '../../common/ScheduleTiming'
import { parseExcludedHours, buildExcludedHours }                                           from '../../common/ScheduleWeekly'
import { useIntentContext }                                                                 from '../../IntentContext'
import { createUseIntentTransition, FormValues, IntentTransitionPayload, useInitialValues } from '../../useIntentTransition'
import { Actions, getTransitionStatus, TransitionIntentItem }                               from '../../utils'
import { useIntentAIEcoFlexQuery }                                                          from '../ComparisonDonutChart/services'

import { Introduction } from './Introduction'
import { Priority }     from './Priority'
import { Settings }     from './Settings'
import { Summary }      from './Summary'

type FormVal = {
  enable: boolean,
  excludedHours?: Record<string, string[]>,
  enableExcludedHours?:boolean
  excludedAPs?:[NetworkNode[]]
  enableExcludedAPs?:boolean
}
function getFormDTO (values: FormValues<FormVal>): IntentTransitionPayload {
  const isEnabled = values.preferences?.enable
  const { status, statusReason } = getTransitionStatus(
    isEnabled ? Actions.Optimize : Actions.Pause,
    values as TransitionIntentItem
  )
  const dto = {
    id: values.id,
    status,
    statusReason
  } as IntentTransitionPayload
  if (isEnabled) {
    const excludedHours = values.preferences?.enableExcludedHours
      ? parseExcludedHours(values.preferences?.excludedHours)
      : undefined
    const excludedAPs = values.preferences?.enableExcludedAPs
      ? values.preferences?.excludedAPs
      : undefined
    dto.metadata = {
      preferences: { ..._.pick(values, ['averagePowerPrice']), excludedHours, excludedAPs },
      scheduledAt: getScheduledAt(values).utc().toISOString()
    }
  }
  return dto
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useIntentTransition = createUseIntentTransition<FormVal>(getFormDTO as any)
export const IntentAIForm: React.FC = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { submit } = useIntentTransition()
  const { intent: { metadata: { preferences } } } = useIntentContext()
  const kpiQuery = useIntentAIEcoFlexQuery()
  const averagePowerPrice = preferences?.averagePowerPrice
    ? preferences.averagePowerPrice
    : { currency: 'USD', value: 0.131 }
  const excludedHours = buildExcludedHours(preferences?.excludedHours)
  const excludedAPs = preferences?.excludedAPs
    ?.map(path => path.map(
      ({ type, ...rest }) => ({ type, ...rest }) // APSelectionInput needs type as first key
    )) as [NetworkNode[]]
  const enableExcludedAPs = Boolean(excludedAPs?.length)

  // always enable = true, because only new, scheduled, active, applyscheduled can open wizard
  const initialValues = {
    ...useInitialValues(),
    preferences: {
      enable: true,
      excludedHours,
      enableExcludedHours: !!excludedHours,
      excludedAPs,
      enableExcludedAPs
    },
    averagePowerPrice
  }

  return (<>
    <IntentWizardHeader />

    <StepsForm
      onCancel={() => { navigate(-1) }}
      onFinish={async (values) => { submit(values) }}
      buttonLabel={{
        submit: $t({ defaultMessage: 'Apply' })
      }}
      initialValues={initialValues}
    >
      <StepsForm.StepForm
        title={$t({ defaultMessage: 'Introduction' })}
        children={<Introduction kpiQuery={kpiQuery}/>}
      />
      <StepsForm.StepForm
        title={$t({ defaultMessage: 'Intent Priority' })}
        children={<Priority />}
      />
      <StepsForm.StepForm
        title={$t({ defaultMessage: 'Settings' })}
        children={<Settings />}
      />
      <StepsForm.StepForm
        title={$t({ defaultMessage: 'Summary' })}
        children={<Summary kpiQuery={kpiQuery} />}
      />
    </StepsForm>
  </>)
}
