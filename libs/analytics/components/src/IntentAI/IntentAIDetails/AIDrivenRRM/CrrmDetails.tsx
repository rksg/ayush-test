import { useState } from 'react'

import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import { GridCol, GridRow, Loader, PageHeader, recommendationBandMapping } from '@acx-ui/components'
import { Features, useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import { useParams }                                                       from '@acx-ui/react-router-dom'

import { FixedAutoSizer }               from '../../../DescriptionSection/styledComponents'
import {
  useRecommendationCodeQuery,
  useConfigRecommendationDetailsQuery
} from '../../IntentAIForm/services'
import { SummaryGraphAfter, SummaryGraphBefore } from '../../RRMGraph'
import { useIntentAICRRMQuery }                  from '../../RRMGraph/services'
import { AIDrivenRRMHeader, AIDrivenRRMIcon }    from '../styledComponents'

import { CrrmBenefits }    from './CrrmBenefits'
import { CrrmGraph }       from './CrrmGraph'
import { CrrmValuesExtra } from './CrrmValuesExtra'
import { Overview }        from './Overview'
import { StatusTrail }     from './StatusTrail'

export const CrrmDetails = () => {
  const { $t } = useIntl()
  const params = useParams()
  const id = get(params, 'recommendationId', undefined) as string

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
  const queryResult = useIntentAICRRMQuery(details?.id, band)
  const crrmData = queryResult.data!

  return <Loader states={[codeQuery, detailsQuery, queryResult]}>
    {details && <PageHeader
      title={$t({ defaultMessage: 'Intent Details' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'AI Assurance' }) },
        { text: $t({ defaultMessage: 'Intent AI' }),
          link: 'analytics/intentAI' }
      ]}
      // extra={hasPermission({ permission: 'WRITE_AI_DRIVEN_RRM', scopes: [WifiScopes.UPDATE] })
      //   ? [] // TODO: Action buttom
      //   : []
      // }
    />}
    <GridRow>
      <GridCol col={{ span: 4 }}>
        <FixedAutoSizer>
          {({ width }) => (<div style={{ width }}>
            <GridRow>
              <AIDrivenRRMHeader>
                <AIDrivenRRMIcon />
                {$t({ defaultMessage: 'AI-Driven RRM' })}
              </AIDrivenRRMHeader>
            </GridRow>
            <GridRow>
              <GridCol col={{ span: 24 }}>
                <Overview details={details} />
              </GridCol>
            </GridRow>
          </div>)}
        </FixedAutoSizer>
      </GridCol>
      <div hidden>
        <SummaryGraphBefore
          details={details}
          crrmData={crrmData}
          setSummaryUrlBefore={setSummaryUrlBefore}
          detailsPage={true}
        />
        <SummaryGraphAfter
          crrmData={crrmData}
          setSummaryUrlAfter={setSummaryUrlAfter}
          detailsPage={true}
        />
      </div>
      <GridCol col={{ span: 20 }}>
        <CrrmBenefits details={details} crrmData={crrmData}/>
        <CrrmGraph
          details={details}
          summaryUrlBefore={summaryUrlBefore}
          summaryUrlAfter={summaryUrlAfter}
          crrmData={crrmData}
        />
        <CrrmValuesExtra details={details}/>
        <StatusTrail details={details}/>
      </GridCol>
    </GridRow>
  </Loader>
}
