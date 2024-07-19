/* eslint-disable max-len */
import React from 'react'

import _                                             from 'lodash'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  Loader
} from '@acx-ui/components'
import { get }                    from '@acx-ui/config'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { formatter }              from '@acx-ui/formatter'
import { useParams }              from '@acx-ui/react-router-dom'

import { categories, CodeInfo, priorities, RecommendationConfig, states, StateType } from '../config'
import { useRecommendationCodeQuery, useConfigRecommendationDetailsQuery }           from '../services'
import * as UI                                                                       from '../styledComponents'

import { Introduction } from './introduction'
import { Priority }     from './priority'
import { Settings }     from './settings'
import { Summary }      from './summary'

export const codes = {
  'c-crrm-channel24g-auto': {
    category: categories['AI-Driven Cloud RRM'],
    summary: defineMessage({ defaultMessage: 'Optimal Ch/Width and Tx Power found for 2.4 GHz radio' }),
    priority: priorities.high,
    valueText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' }),
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
    valueText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' }),
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
    kpis: [{
      key: 'number-of-interfering-links',
      label: defineMessage({ defaultMessage: 'Number of Interfering Links' }),
      format: formatter('countFormat'),
      deltaSign: '-'
    }],
    continuous: true
  }
} as Record<string, Partial<RecommendationConfig> & CodeInfo>

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
      <StepsForm
        buttonLabel={{
          submit: 'Apply'
        }}
        initialValues={_.merge(defaultValue, details)}
      >
        <StepsForm.StepForm
          title={$t(steps.title.introduction)}
          children={<Introduction />}
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
          children={<Summary />}
        />
      </StepsForm>
    </Loader>
  )
}
