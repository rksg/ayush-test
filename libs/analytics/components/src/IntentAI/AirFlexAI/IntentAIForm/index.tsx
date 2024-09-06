import React, { useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'

import { IntentWizardHeader }                                                         from '../../common/IntentWizardHeader'
import { useIntentContext }                                                           from '../../IntentContext'

import { Introduction } from './Introduction'
import { Priority }     from './Priority'
import { Settings }     from './Settings'
import { Summary }      from './Summary'
import { createUseIntentTransition, FormValues, IntentTransitionPayload, useInitialValues } from '../../useIntentTransition'
import { getScheduledAt } from '../../common/ScheduleTiming'
import { Statuses } from '../../states'
import { Actions, getTransitionStatus, TransitionIntentItem } from '../../utils'

type FormVal = { enable: boolean }
function getFormDTO (values: FormValues<FormVal>): IntentTransitionPayload {
  const { status, statusReason} = getTransitionStatus(
    values.preferences?.enable ? Actions.Optimize : Actions.Pause,
    values as TransitionIntentItem
  )
  return {
    id: values.id,
    status,
    statusReason,
    metadata: {
      ..._.pick(values, ['wlans']),
      scheduledAt: getScheduledAt(values).utc().toISOString()
    }
  }
}

const useIntentTransition = createUseIntentTransition<FormVal>(getFormDTO as any)
export const IntentAIForm: React.FC = () => {
  const { intent } = useIntentContext()
  const { $t } = useIntl() 
  const { submit } = useIntentTransition()
  // always enable = true, because only new, scheduled, active, applyscheduled can open wizard
  const initialValues = { ...useInitialValues(), preferences: { enable: true } }
  console.log(initialValues, intent)

  return (<>
    <IntentWizardHeader />
    
    <StepsForm
      onFinish={async (values) => { 

        console.log(getFormDTO(values))
        submit(values)
      }}
      buttonLabel={{
        submit: $t({ defaultMessage: 'Apply' })
      }}
      initialValues={initialValues}
    >
      <StepsForm.StepForm
        title={$t({ defaultMessage: 'Introduction' })}
        children={<Introduction/>}
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
        children={<Summary />}
      />
    </StepsForm>
  </>)
}
