/* eslint-disable max-len */
import React, { useState } from 'react'

import _                                             from 'lodash'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  Loader,
  recommendationBandMapping
} from '@acx-ui/components'
import { get }                    from '@acx-ui/config'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { formatter }              from '@acx-ui/formatter'
import { useParams }              from '@acx-ui/react-router-dom'

import { SliderGraphAfter, SliderGraphBefore, SummaryGraphAfter, SummaryGraphBefore } from '../../RRMGraph'
import { useIntentAICRRMQuery }                                                       from '../../RRMGraph/services'
import { crrmText }                                                                   from '../../utils'
import { categories, CodeInfo, priorities, RecommendationConfig, states, StateType }  from '../config'
import { useRecommendationCodeQuery, useConfigRecommendationDetailsQuery }            from '../services'
import * as UI                                                                        from '../styledComponents'

import { Introduction } from './introduction'
import { Priority }     from './priority'
import { Settings }     from './settings'
import { Summary }      from './summary'

export const codes = {
  'c-crrm-channel24g-auto': {
    category: categories['AI-Driven Cloud RRM'],
    summary: defineMessage({ defaultMessage: 'Optimal Ch/Width and Tx Power found for 2.4 GHz radio' }),
    priority: priorities.high,
    valueFormatter: crrmText,
    valueText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' }),
    actionText: defineMessage({ defaultMessage: '{scope} is experiencing high co-channel interference in 2.4 GHz band due to suboptimal channel planning. The channel plan, and potentially channel bandwidth and AP transmit power can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience.{isDataRetained, select, true {} other { {dataNotRetainedMsg}}}' }),
    appliedActionText: defineMessage({ defaultMessage: '{scope} had experienced high co-channel interference in 2.4 GHz band due to suboptimal channel planning as of {initialTime}.{isDataRetained, select, true { The recommendation had been applied as of {appliedTime} and interfering links have reduced. AI-Driven RRM will continue to monitor and adjust further everyday to continue to minimize co-channel interference.} other {}}{isDataRetained, select, true {} other { {dataNotRetainedMsg}}}' }),
    partialOptimizedActionText: defineMessage({ defaultMessage: '{scope} is experiencing high co-channel interference in 2.4 GHz band due to suboptimal channel planning. The channel plan can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience.{isDataRetained, select, true {} other { {dataNotRetainedMsg}}}' }),
    reasonText: defineMessage({ defaultMessage: 'Based on our AI Analytics, enabling AI-Driven Cloud RRM will decrease the number of interfering links from {before} to {after}.' }),
    appliedReasonText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan, bandwidth and AP transmit power when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    partialOptimizationAppliedReasonText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    tradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten.' }),
    partialOptimizedTradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten.' }),
    kpis: [{
      key: 'number-of-interfering-links',
      label: defineMessage({ defaultMessage: 'Number of Interfering Links' }),
      format: formatter('countFormat'),
      deltaSign: '-'
    }],
    continuous: true
  },
  'c-crrm-channel5g-auto': {
    category: categories['AI-Driven Cloud RRM'],
    summary: defineMessage({ defaultMessage: 'Optimal Ch/Width and Tx Power found for 5 GHz radio' }),
    priority: priorities.high,
    valueFormatter: crrmText,
    valueText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' }),
    actionText: defineMessage({ defaultMessage: '{scope} is experiencing high co-channel interference in 5 GHz band due to suboptimal channel planning. The channel plan, and potentially channel bandwidth and AP transmit power can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience.{isDataRetained, select, true {} other { {dataNotRetainedMsg}}}' }),
    appliedActionText: defineMessage({ defaultMessage: '{scope} had experienced high co-channel interference in 5 GHz band due to suboptimal channel planning as of {initialTime}.{isDataRetained, select, true { The recommendation had been applied as of {appliedTime} and interfering links have reduced. AI-Driven RRM will continue to monitor and adjust further everyday to continue to minimize co-channel interference.} other {}}{isDataRetained, select, true {} other { {dataNotRetainedMsg}}}' }),
    partialOptimizedActionText: defineMessage({ defaultMessage: '{scope} is experiencing high co-channel interference in 5 GHz band due to suboptimal channel planning. The channel plan can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience.{isDataRetained, select, true {} other { {dataNotRetainedMsg}}}' }),
    reasonText: defineMessage({ defaultMessage: 'Based on our AI Analytics, enabling AI-Driven Cloud RRM will decrease the number of interfering links from {before} to {after}.' }),
    appliedReasonText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan, bandwidth and AP transmit power when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    partialOptimizationAppliedReasonText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    tradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage.' }),
    partialOptimizedTradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage.' }),
    kpis: [{
      key: 'number-of-interfering-links',
      label: defineMessage({ defaultMessage: 'Number of Interfering Links' }),
      format: formatter('countFormat'),
      deltaSign: '-'
    }],
    continuous: true
  },
  'c-crrm-channel6g-auto': {
    category: categories['AI-Driven Cloud RRM'],
    summary: defineMessage({ defaultMessage: 'Optimal Ch/Width and Tx Power found for 6 GHz radio' }),
    priority: priorities.high,
    valueFormatter: crrmText,
    valueText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' }),
    actionText: defineMessage({ defaultMessage: '{scope} is experiencing high co-channel interference in 6 GHz band due to suboptimal channel planning. The channel plan, and potentially channel bandwidth and AP transmit power can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience.{isDataRetained, select, true {} other { {dataNotRetainedMsg}}}' }),
    appliedActionText: defineMessage({ defaultMessage: '{scope} had experienced high co-channel interference in 6 GHz band due to suboptimal channel planning as of {initialTime}.{isDataRetained, select, true { The recommendation had been applied as of {appliedTime} and interfering links have reduced. AI-Driven RRM will continue to monitor and adjust further everyday to continue to minimize co-channel interference.} other {}}{isDataRetained, select, true {} other { {dataNotRetainedMsg}}}' }),
    partialOptimizedActionText: defineMessage({ defaultMessage: '{scope} is experiencing high co-channel interference in 6 GHz band due to suboptimal channel planning. The channel plan can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience.{isDataRetained, select, true {} other { {dataNotRetainedMsg}}}' }),
    reasonText: defineMessage({ defaultMessage: 'Based on our AI Analytics, enabling AI-Driven Cloud RRM will decrease the number of interfering links from {before} to {after}.' }),
    appliedReasonText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan, bandwidth and AP transmit power when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    partialOptimizationAppliedReasonText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    tradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten.' }),
    partialOptimizedTradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten.' }),
    kpis: [{
      key: 'number-of-interfering-links',
      label: defineMessage({ defaultMessage: 'Number of Interfering Links' }),
      format: formatter('countFormat'),
      deltaSign: '-'
    }],
    continuous: true
  }
} as Record<string, RecommendationConfig & CodeInfo>

export const statusTrailMsgs = Object.entries(states).reduce((acc, [key, val]) => {
  acc[key as StateType] = val.text
  return acc
}, {} as Record<StateType, MessageDescriptor>)

export const steps = {
  title: {
    introduction: defineMessage({ defaultMessage: 'Introduction' }),
    priority: defineMessage({ defaultMessage: 'Intent Priority' }),
    settings: defineMessage({ defaultMessage: 'Settings' }),
    summary: defineMessage({ defaultMessage: 'Summary' })
  },
  intent: defineMessage({ defaultMessage: 'Client density vs Client throughput' }),
  category: defineMessage({ defaultMessage: 'Wi-Fi Client Experience' })
}

export const crrmIntent = {
  full: {
    value: defineMessage({ defaultMessage: 'Client Density' }),
    title: defineMessage({ defaultMessage: 'High number of clients in a dense network' }),
    content: defineMessage({ defaultMessage: 'High client density network requires low interfering channels which fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.' })
  },
  partial: {
    value: defineMessage({ defaultMessage: 'Client Throughput' }),
    title: defineMessage({ defaultMessage: 'High client throughput in sparse network' }),
    content: defineMessage({ defaultMessage: 'In sparse networks with high client throughput, moderate interference is manageable due to optimized resource allocation, minimal competition for bandwidth, and strong signal strength. This allows for stable connections and satisfactory performance, outweighing drawbacks of interference.' })
  }
}

export const isOptimized = (value: boolean) => value ? 'full' : 'partial'

export function AIDrivenRRM () {
  const { $t } = useIntl()
  const params = useParams()
  const id = params?.recommendationId!
  const [sliderUrlBefore, setSliderUrlBefore] = useState<string>('')
  const [sliderUrlAfter, setSliderUrlAfter] = useState<string>('')
  const [summaryUrlBefore, setSummaryUrlBefore] = useState<string>('')
  const [summaryUrlAfter, setSummaryUrlAfter] = useState<string>('')

  const isCrrmPartialEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_CRRM_PARTIAL),
    useIsSplitOn(Features.CRRM_PARTIAL)
  ].some(Boolean)
  const codeQuery = useRecommendationCodeQuery({ id }, { skip: !Boolean(id) })
  const detailsQuery = useConfigRecommendationDetailsQuery(
    { ...codeQuery.data!, isCrrmPartialEnabled },
    { skip: !Boolean(codeQuery.data?.code) }
  )
  const details = detailsQuery.data!

  const band = recommendationBandMapping[
    details?.code as keyof typeof recommendationBandMapping]
  const queryResult = useIntentAICRRMQuery(details, band)
  const crrmData = queryResult.data!
  const breadcrumb = [
    { text: $t({ defaultMessage: 'AI Assurance' }) },
    { text: $t({ defaultMessage: 'AI Analytics' }) },
    { text: $t({ defaultMessage: 'IntentAI' }), link: '/analytics/intentAI' }
  ]
  const defaultValue = {
    preferences: {
      crrmFullOptimization: true
    }
  }

  return (
    <Loader states={[codeQuery, detailsQuery]}>
      <PageHeader
        breadcrumb={breadcrumb}
        titlePrefix={<UI.AIDrivenRRMIcon />}
        title={$t({ defaultMessage: 'AI-Driven RRM' })}
        subTitle={[
          {
            label: $t({ defaultMessage: 'Intent' }),
            value: [$t(steps.intent) as string]
          },
          {
            label: get('IS_MLISA_SA')
              ? $t({ defaultMessage: 'Zone' })
              : $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
            value: [details?.sliceValue]
          }
        ]}
      />
      {/* hide the graph, only rendering the graph image for the slider & summary */}
      <div hidden>
        <SliderGraphBefore crrmData={crrmData} setSliderUrlBefore={setSliderUrlBefore} />
        <SliderGraphAfter crrmData={crrmData} setSliderUrlAfter={setSliderUrlAfter} />
        <SummaryGraphBefore details={details} crrmData={crrmData} setSummaryUrlBefore={setSummaryUrlBefore} />
        <SummaryGraphAfter crrmData={crrmData} setSummaryUrlAfter={setSummaryUrlAfter} />
      </div>
      <StepsForm
        buttonLabel={{
          submit: $t({ defaultMessage: 'Apply' })
        }}
        initialValues={_.merge(defaultValue, details)}
      >
        <StepsForm.StepForm
          title={$t(steps.title.introduction)}
          children={<Introduction sliderUrlBefore={sliderUrlBefore} sliderUrlAfter={sliderUrlAfter} queryResult={queryResult} />}
        />
        <StepsForm.StepForm
          title={$t(steps.title.priority)}
          children={<Priority />}
        />
        <StepsForm.StepForm
          title={$t(steps.title.settings)}
          children={<Settings />}
        />
        <StepsForm.StepForm
          title={$t(steps.title.summary)}
          children={<Summary summaryUrlBefore={summaryUrlBefore} summaryUrlAfter={summaryUrlAfter} crrmData={crrmData} />}
        />
      </StepsForm>
    </Loader>
  )
}
