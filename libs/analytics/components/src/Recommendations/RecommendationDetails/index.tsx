import { get }                    from 'lodash'
import { useIntl, defineMessage } from 'react-intl'

import { GridCol, GridRow, Loader, PageHeader } from '@acx-ui/components'
import { useParams }                            from '@acx-ui/react-router-dom'

import { Kpis }                          from './kpis'
import MuteRecommendation                from './MuteRecommendation'
import { Overview }                      from './overview'
import { useRecommendationDetailsQuery } from './services'
import { Values }                        from './values'

export const linkMap = {
  aiOps: defineMessage({ defaultMessage: 'AI Operations' }),
  crrm: defineMessage({ defaultMessage: 'AI-Driven RRM' })
}

export const RecommendationDetails = () => {
  const { $t } = useIntl()
  const params = useParams()
  const id = get(params, 'id', undefined) as string
  const link = 'recommendations/aiOps'
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
        { text: $t(linkMap['aiOps']), link }
      ]}
      extra={[<MuteRecommendation {...{
        id: details.id,
        isMuted: details.isMuted,
        link,
        type: $t(linkMap['aiOps'])
      }} />]}
    />}
    <GridRow>
      <GridCol col={{ span: 3 }}>
        <Overview details={details} />
      </GridCol>
      <GridCol col={{ span: 13 }}>
        <Values details={details}/>
      </GridCol>
      <GridCol col={{ span: 8 }}>
        <Kpis details={details} />
      </GridCol>
    </GridRow>
  </Loader>
}
