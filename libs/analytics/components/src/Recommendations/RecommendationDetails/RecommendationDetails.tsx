import { get }                    from 'lodash'
import { useIntl, defineMessage } from 'react-intl'

import { GridCol, GridRow, Loader, PageHeader } from '@acx-ui/components'
import { Features, useIsSplitOn }               from '@acx-ui/feature-toggle'
import { useParams }                            from '@acx-ui/react-router-dom'

import { FixedAutoSizer }        from '../../DescriptionSection/styledComponents'
import { RecommendationActions } from '../RecommendationActions'

import { Kpis }                   from './Kpis'
import { Overview }               from './Overview'
import RecommendationSetting      from './RecommendationSetting'
import {
  useRecommendationCodeQuery,
  useRecommendationDetailsQuery
} from './services'
import { StatusTrail } from './StatusTrail'
import { Values }      from './Values'

const aiOps = defineMessage({ defaultMessage: 'AI Operations' })

export const RecommendationDetails = () => {
  const { $t } = useIntl()
  const params = useParams()
  const id = get(params, 'id', undefined) as string
  const link = 'analytics/recommendations/aiOps'
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
  return <Loader states={[codeQuery, detailsQuery]}>
    {details && <PageHeader
      title={$t(details.summary)}
      breadcrumb={[
        { text: $t({ defaultMessage: 'AI Assurance' }) },
        { text: $t({ defaultMessage: 'AI Analytics' }) },
        { text: $t(aiOps), link }
      ]}
      extra={[<RecommendationSetting {...{
        id: details.id,
        isMuted: details.isMuted,
        link,
        type: $t(aiOps),
        actions: <RecommendationActions recommendation={
          {
            ...details,
            statusEnum: details.status
          }
        } />
      }} />]}
    />}
    <GridRow>
      <GridCol col={{ span: 4 }}>
        <FixedAutoSizer>
          {({ width }) => (<div style={{ width }}>
            <Overview details={details} />
          </div>)}
        </FixedAutoSizer>
      </GridCol>
      <GridCol col={{ span: 12 }}>
        <Values details={details}/>
      </GridCol>
      <GridCol col={{ span: 8 }}>
        <Kpis details={details} />
        <StatusTrail details={details}/>
      </GridCol>
    </GridRow>
  </Loader>
}
