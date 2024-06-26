import React from 'react'

import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import { PageHeader, StepsForm, Loader } from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import { useParams }                     from '@acx-ui/react-router-dom'

// import { statusTrailMsgs }                                           from './config'
import { steps }                                                     from './constants'
import { Introduction }                                              from './Form/introduction'
import { Priority }                                                  from './Form/priority'
import { Settings }                                                  from './Form/settings'
import { Summary }                                                   from './Form/summary'
import { useRecommendationCodeQuery, useRecommendationDetailsQuery } from './services'
import * as UI                                                       from './styledComponents'

export function IntentAIDrivenRRM () {
  const { $t } = useIntl()
  const params = useParams()
  const id = get(params, 'id', undefined) as string
  const isCrrmPartialEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_CRRM_PARTIAL),
    useIsSplitOn(Features.CRRM_PARTIAL)
  ].some(Boolean)
  const codeQuery = useRecommendationCodeQuery({ id }, { skip: !Boolean(id) })
  const detailsQuery = useRecommendationDetailsQuery(
    { ...codeQuery.data!, isCrrmPartialEnabled },
    { skip: !Boolean(codeQuery.data?.code) }
  )
  const details = detailsQuery.data!

  return (
    <Loader states={[detailsQuery]}>
      <PageHeader
        title={<UI.Header>
          <UI.AIDrivenRRMIcon />
          <UI.HeaderTitle>
            {$t({ defaultMessage: 'AI-Driven RRM' })}
          </UI.HeaderTitle>
        </UI.Header>}
        subTitle={
          <>
            {/* eslint-disable-next-line max-len */}
            {$t({ defaultMessage: 'Intent: Client density vs Client throughput' })} | {$t({ defaultMessage: 'Zone: ' })} {details?.sliceValue}
          </>
        }
      />
      <StepsForm
        buttonLabel={{
          submit: 'Apply'
        }}
        initialValues={detailsQuery?.data!}
      >
        <StepsForm.StepForm
          title={$t(steps.introduction)}
          children={<Introduction />}
        />
        <StepsForm.StepForm
          title={$t(steps.priority)}
          children={<Priority />}
        />
        <StepsForm.StepForm
          title={$t(steps.settings)}
          children={<Settings />}
        />
        <StepsForm.StepForm
          title={$t(steps.summary)}
          children={<Summary />}
        />
      </StepsForm>
    </Loader>
  )
}
