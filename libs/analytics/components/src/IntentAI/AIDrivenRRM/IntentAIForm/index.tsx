import React, { useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import { IntentWizardHeader }                                                         from '../../common/IntentWizardHeader'
import { useIntentContext }                                                           from '../../IntentContext'
import { SliderGraphAfter, SliderGraphBefore, SummaryGraphAfter, SummaryGraphBefore } from '../RRMGraph'
import { useIntentAICRRMQuery }                                                       from '../RRMGraph/services'

import { Introduction } from './Introduction'
import { Priority }     from './Priority'
import { Settings }     from './Settings'
import { Summary }      from './Summary'

export function IntentAIForm () {
  const { intent } = useIntentContext()
  const { $t } = useIntl()

  const queryResult = useIntentAICRRMQuery()
  const crrmData = queryResult.data!
  const [sliderUrlBefore, setSliderUrlBefore] = useState<string>('')
  const [sliderUrlAfter, setSliderUrlAfter] = useState<string>('')
  const [summaryUrlBefore, setSummaryUrlBefore] = useState<string>('')
  const [summaryUrlAfter, setSummaryUrlAfter] = useState<string>('')

  const defaultValue = {
    preferences: {
      crrmFullOptimization: true
    }
  }

  return (<>
    <IntentWizardHeader />
    {/* hide the graph, only rendering the graph image for the slider & summary */}
    {crrmData && <div hidden data-testid='hidden-graph'>
      <SliderGraphBefore crrmData={crrmData} setUrl={setSliderUrlBefore} />
      <SliderGraphAfter crrmData={crrmData} setUrl={setSliderUrlAfter} />
      <SummaryGraphBefore crrmData={crrmData} setUrl={setSummaryUrlBefore} />
      <SummaryGraphAfter crrmData={crrmData} setUrl={setSummaryUrlAfter} />
    </div>}
    <StepsForm
      buttonLabel={{
        submit: $t({ defaultMessage: 'Apply' })
      }}
      initialValues={_.merge(defaultValue, intent)}
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
        children={<Settings />}
      />
      <StepsForm.StepForm
        title={$t({ defaultMessage: 'Summary' })}
        children={<Summary
          summaryUrlBefore={summaryUrlBefore}
          summaryUrlAfter={summaryUrlAfter}
          crrmData={crrmData}
        />}
      />
    </StepsForm>
  </>)
}
