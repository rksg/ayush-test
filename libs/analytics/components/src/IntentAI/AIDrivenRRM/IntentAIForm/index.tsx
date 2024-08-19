/* eslint-disable max-len */
import React, { useState } from 'react'

import _                                             from 'lodash'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { StepsForm } from '@acx-ui/components'
import { get }       from '@acx-ui/config'

import { IntentWizardHeader }                                                         from '../../common/IntentWizardHeader'
import { useIntentContext }                                                           from '../../IntentContext'
import { SliderGraphAfter, SliderGraphBefore, SummaryGraphAfter, SummaryGraphBefore } from '../RRMGraph'
import { useIntentAICRRMQuery }                                                       from '../RRMGraph/services'

import { Introduction } from './Introduction'
import { Priority }     from './Priority'
import { Settings }     from './Settings'
import { Summary }      from './Summary'

export type IntentConfig = {
  reasonText: MessageDescriptor
  tradeoffText: MessageDescriptor
  appliedReasonText?: MessageDescriptor
  partialOptimizationAppliedReasonText?: MessageDescriptor
  partialOptimizedTradeoffText?: MessageDescriptor
}

const reasonText = defineMessage({ defaultMessage: 'Based on our AI Analytics, enabling AI-Driven Cloud RRM will decrease the number of interfering links from {before} to {after}.' })
const appliedReasonText = defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan, bandwidth and AP transmit power when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' })
const partialOptimizationAppliedReasonText = defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' })

// TODO: refactor: Find a way to configure this in another way
export const codes = {
  'c-crrm-channel24g-auto': {
    reasonText,
    appliedReasonText,
    partialOptimizationAppliedReasonText,
    tradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten.' }),
    partialOptimizedTradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten.' })
  },
  'c-crrm-channel5g-auto': {
    reasonText,
    appliedReasonText,
    partialOptimizationAppliedReasonText,
    tradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage.' }),
    partialOptimizedTradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage.' })
  },
  'c-crrm-channel6g-auto': {
    reasonText,
    appliedReasonText,
    partialOptimizationAppliedReasonText,
    tradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten.' }),
    partialOptimizedTradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten.' })
  }
} as Record<string, IntentConfig>

export const isOptimized = (value: boolean) => value ? 'full' : 'partial'

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
        children={<Introduction sliderUrlBefore={sliderUrlBefore} sliderUrlAfter={sliderUrlAfter} queryResult={queryResult} />}
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
        children={<Summary summaryUrlBefore={summaryUrlBefore} summaryUrlAfter={summaryUrlAfter} crrmData={crrmData} />}
      />
    </StepsForm>
  </>)
}
