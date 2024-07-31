import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import { GridCol, GridRow, Loader, PageHeader } from '@acx-ui/components'
import { useParams }                            from '@acx-ui/react-router-dom'

import { FixedAutoSizer }               from '../../../DescriptionSection/styledComponents'
import {
  useRecommendationCodeQuery,
  useConfigRecommendationDetailsQuery
} from '../../IntentAIForm/services'
import { AIDrivenRRMHeader, AIDrivenRRMIcon } from '../styledComponents'

import { CrrmBenefits }    from './CrrmBenefits'
import { CrrmGraph }       from './CrrmGraph'
import { CrrmValuesExtra } from './CrrmValuesExtra'
import { Overview }        from './Overview'
import { StatusTrail }     from './StatusTrail'

export const CrrmDetails = () => {
  const { $t } = useIntl()
  const params = useParams()
  const id = get(params, 'recommendationId', undefined) as string
  const codeQuery = useRecommendationCodeQuery({ id }, { skip: !Boolean(id) })
  const detailsQuery = useConfigRecommendationDetailsQuery(
    codeQuery.data!,
    { skip: !Boolean(codeQuery.data?.code) }
  )
  const details = detailsQuery.data!

  return <Loader states={[codeQuery, detailsQuery]}>
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
      <GridCol col={{ span: 20 }}>
        <CrrmBenefits details={details}/>
        <CrrmGraph details={details}/>
        <CrrmValuesExtra details={details}/>
        <StatusTrail details={details}/>
      </GridCol>
    </GridRow>
  </Loader>
}
