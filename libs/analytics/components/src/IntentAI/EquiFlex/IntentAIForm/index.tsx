import React from 'react'

import { useIntl } from 'react-intl'

import { StepsForm }   from '@acx-ui/components'
import { useNavigate } from '@acx-ui/react-router-dom'

import { IntentWizardHeader }                                                               from '../../common/IntentWizardHeader'
import { getScheduledAt }                                                                   from '../../common/ScheduleTiming'
import { IntentWlan }                                                                       from '../../config'
import { useIntentContext }                                                                 from '../../IntentContext'
import { createUseIntentTransition, FormValues, IntentTransitionPayload, useInitialValues } from '../../useIntentTransition'
import { Actions, getTransitionStatus, TransitionIntentItem }                               from '../../utils'

import { Introduction } from './Introduction'
import { Priority }     from './Priority'
import { Settings }     from './Settings'
import { Summary }      from './Summary'
import { Wlan }         from './WlanSelection'

type FormVal = { enable: boolean }
function getFormDTO (values: FormValues<FormVal>): IntentTransitionPayload {
  const isEnabled = values.preferences?.enable
  const { status, statusReason } = getTransitionStatus(
    isEnabled ? Actions.Optimize : Actions.Pause,
    values as TransitionIntentItem
  )
  const buildWlans = (wlans: Wlan[]):IntentWlan[] =>
    wlans.map(wlan => ({ name: wlan.id!, ssid: wlan.ssid }))

  const dto = {
    id: values.id,
    status,
    statusReason
  } as IntentTransitionPayload
  const wlans = buildWlans(values.wlans ?? [])

  if (isEnabled) {
    dto.metadata = {
      wlans,
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
  const { intent: { metadata } } = useIntentContext()
  const wlans = metadata.wlans ? metadata.wlans : []
  // always enable = true, because only new, scheduled, active, applyscheduled can open wizard
  const initialValues = { ...useInitialValues(),
    preferences: { enable: true },
    wlans: wlans.map(wlan => ({ ...wlan, id: wlan.name }))
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
