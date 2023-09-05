import { get }                    from 'lodash'
import { useIntl, defineMessage } from 'react-intl'

import { GridCol, GridRow, Loader, PageHeader } from '@acx-ui/components'
import { useParams }                            from '@acx-ui/react-router-dom'

import { FixedAutoSizer } from '../../DescriptionSection/styledComponents'

import { Kpis }                          from './Kpis'
import MuteRecommendation                from './MuteRecommendation'
import { Overview }                      from './Overview'
import { useRecommendationDetailsQuery } from './services'
import { StatusTrail }                   from './StatusTrail'
import { Values }                        from './Values'

const aiOps = defineMessage({ defaultMessage: 'AI Operations' })

export const RecommendationDetails = () => {
  const { $t } = useIntl()
  const params = useParams()
  const id = get(params, 'id', undefined) as string
  const link = 'analytics/recommendations/aiOps'
  const codeQuery = useRecommendationDetailsQuery({ id }, { skip: !Boolean(id) })
  const detailsQuery = useRecommendationDetailsQuery(
    { ...(codeQuery.data!) },
    { skip: !Boolean(codeQuery.data?.code) })
  const details = detailsQuery.data!
  return <Loader states={[codeQuery, detailsQuery]}>
    {details && <PageHeader
      title={$t(details.summary)}
      breadcrumb={[
        { text: $t({ defaultMessage: 'AI Assurance' }) },
        { text: $t({ defaultMessage: 'AI Analytics' }) },
        { text: $t(aiOps), link }
      ]}
      extra={[<MuteRecommendation {...{
        id: details.id,
        isMuted: details.isMuted,
        link,
        type: $t(aiOps)
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
