import React from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  Loader
} from '@acx-ui/components'
import { get }                    from '@acx-ui/config'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { useParams }              from '@acx-ui/react-router-dom'

import * as config                                                         from './config'
import { Introduction }                                                    from './Form/introduction'
import { Priority }                                                        from './Form/priority'
import { Settings }                                                        from './Form/settings'
import { Summary }                                                         from './Form/summary'
import { useRecommendationCodeQuery, useConfigRecommendationDetailsQuery } from './services'
import * as UI                                                             from './styledComponents'

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
    {
      text: $t({ defaultMessage: 'IntentAI' }),
      link: '/analytics/intentAI'
    }
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
            value: [$t(config.intentTypeMap.aiDrivenRRM.intent) as string]
          },
          {
            label: get('IS_MLISA_SA')
              ? $t({ defaultMessage: 'Zone' })
              : $t({ defaultMessage: 'Venue' }),
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
          title={$t(config.steps.title.introduction)}
          children={<Introduction />}
        />
        <StepsForm.StepForm
          title={$t(config.steps.title.priority)}
          children={<Priority />}
        />
        <StepsForm.StepForm
          title={$t(config.steps.title.settings)}
          children={<Settings />}
        />
        <StepsForm.StepForm
          title={$t(config.steps.title.summary)}
          children={<Summary />}
        />
      </StepsForm>
    </Loader>
  )
}
