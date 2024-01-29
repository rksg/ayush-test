import { get }                    from 'lodash'
import { useIntl, defineMessage } from 'react-intl'

import { impactedArea }                         from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Loader, PageHeader } from '@acx-ui/components'
import { Features, useIsSplitOn }               from '@acx-ui/feature-toggle'
import { useParams }                            from '@acx-ui/react-router-dom'

import { FixedAutoSizer }        from '../../DescriptionSection/styledComponents'
import { RecommendationActions } from '../RecommendationActions'

import { CrrmValues }             from './CrrmValues'
import { CrrmValuesExtra }        from './CrrmValuesExtra'
import { CloudRRMGraph }          from './Graph'
import { Overview }               from './Overview'
import RecommendationSetting      from './RecommendationSetting'
import {
  useRecommendationCodeQuery,
  useRecommendationDetailsQuery
} from './services'
import { StatusTrail } from './StatusTrail'

const crrm = defineMessage({ defaultMessage: 'AI-Driven RRM' })

export const CrrmDetails = () => {
  const { $t } = useIntl()
  const params = useParams()
  const id = get(params, 'id', undefined) as string
  const link = 'analytics/recommendations/crrm'
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
      title={impactedArea(details.path, details.sliceValue)}
      breadcrumb={[
        { text: $t({ defaultMessage: 'AI Assurance' }) },
        { text: $t({ defaultMessage: 'AI Analytics' }) },
        { text: $t(crrm), link }
      ]}
      extra={[<RecommendationSetting {...{
        id: details.id,
        isMuted: details.isMuted,
        link,
        type: $t(crrm),
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
      <GridCol col={{ span: 14 }}>
        <CrrmValues details={details}/>
        <CloudRRMGraph details={details}/>
      </GridCol>
      <GridCol col={{ span: 6 }}>
        <CrrmValuesExtra details={details}/>
        <StatusTrail details={details}/>
      </GridCol>
    </GridRow>
  </Loader>
}
