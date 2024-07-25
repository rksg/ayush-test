import { useIntl } from 'react-intl'

import { TrendTypeEnum }                                             from '@acx-ui/analytics/utils'
import { Card, GridCol, GridRow, Loader, recommendationBandMapping } from '@acx-ui/components'

import { EnhancedRecommendation }            from '../../IntentAIForm/services'
import { getGraphKPI }                       from '../../RRMGraph'
import { useIntentAICRRMQuery }              from '../../RRMGraph/services'
import { dataRetentionText, isDataRetained } from '../../utils'
import {
  BenefitsBody,
  BenefitsHeader,
  BenefitsValue,
  DetailsHeader,
  DetailsWrapper,
  TrendPill
} from '../styledComponents'

export const CrrmBenefits = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const band = recommendationBandMapping[details.code as keyof typeof recommendationBandMapping]
  const queryResult = useIntentAICRRMQuery(details, band)
  const crrmData = queryResult?.data

  const { interferingLinks, linksPerAP } = getGraphKPI(details as EnhancedRecommendation, crrmData)

  return <Loader states={[queryResult]}>
    <DetailsHeader>{$t({ defaultMessage: 'Benefits' })}</DetailsHeader>
    {isDataRetained(details.dataEndTime)
      ? <DetailsWrapper>
        <GridRow>
          <GridCol col={{ span: 12 }}>
            <Card type='default'>
              <BenefitsHeader>{$t({ defaultMessage: 'Interfering links' })}</BenefitsHeader>
              <BenefitsBody>
                <BenefitsValue>{interferingLinks.after}</BenefitsValue>
                <TrendPill
                  value={interferingLinks.links.value as string}
                  trend={interferingLinks.links.trend as TrendTypeEnum} />
              </BenefitsBody>
            </Card>
          </GridCol>
          <GridCol col={{ span: 12 }}>
            <Card type='default'>
              <BenefitsHeader>
                {$t({ defaultMessage: 'Average interfering links per AP' })}
              </BenefitsHeader>
              <BenefitsBody>
                <BenefitsValue>{Math.ceil(linksPerAP.after)}</BenefitsValue>
                <TrendPill
                  value={linksPerAP.average.value as string}
                  trend={linksPerAP.average.trend as TrendTypeEnum} />
              </BenefitsBody>
            </Card>
          </GridCol>
        </GridRow>
      </DetailsWrapper>
      : $t(dataRetentionText)
    }
  </Loader>
}
