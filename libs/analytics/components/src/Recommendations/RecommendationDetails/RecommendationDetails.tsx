import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import { GridCol, GridRow, Loader, PageHeader } from '@acx-ui/components'
import { Features, useIsSplitOn }               from '@acx-ui/feature-toggle'
import { useParams }                            from '@acx-ui/react-router-dom'
import { hasPermission }                        from '@acx-ui/user'

import { FixedAutoSizer } from '../../DescriptionSection/styledComponents'

import { Kpis }                                             from './Kpis'
import { Overview }                                         from './Overview'
import { RecommendationSetting, recommendationTypeMapping } from './RecommendationSetting'
import {
  useRecommendationCodeQuery,
  useRecommendationDetailsQuery
} from './services'
import { StatusTrail } from './StatusTrail'
import { Values }      from './Values'

export const RecommendationDetails = () => {
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
  return <Loader states={[codeQuery, detailsQuery]}>
    {details && <PageHeader
      title={$t(details.summary)}
      breadcrumb={[
        { text: $t({ defaultMessage: 'AI Assurance' }) },
        { text: $t({ defaultMessage: 'AI Analytics' }) },
        { text: $t(recommendationTypeMapping.aiOps.title),
          link: recommendationTypeMapping.aiOps.link }
      ]}
      extra={hasPermission() ? [<RecommendationSetting recommendationDetails={details} />] : []}
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
