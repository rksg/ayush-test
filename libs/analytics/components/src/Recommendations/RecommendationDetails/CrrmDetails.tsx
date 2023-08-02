import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import { GridCol, GridRow, Loader, PageHeader } from '@acx-ui/components'
import { useParams }                            from '@acx-ui/react-router-dom'

import { CrrmValues }                    from './CrrmValues'
import MuteRecommendation                from './MuteRecommendation'
import { Overview }                      from './overview'
import { useRecommendationDetailsQuery } from './services'

import { linkMap } from '.'

export const CrrmDetails = () => {
  const { $t } = useIntl()
  const params = useParams()
  const id = get(params, 'id', undefined) as string
  const activeTab = 'crrm'
  const link = `recommendations/${activeTab}`
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
        { text: $t(linkMap[activeTab]), link }
      ]}
      extra={[<MuteRecommendation {...{
        id: details.id,
        isMuted: details.isMuted,
        link,
        type: $t(linkMap[activeTab])
      }} />]}
    />}
    <GridRow>
      <GridCol col={{ span: 5 }}>
        <Overview details={details} />
      </GridCol>
      <GridCol col={{ span: 19 }}>
        <CrrmValues details={details}/>
      </GridCol>
    </GridRow>
  </Loader>
}
