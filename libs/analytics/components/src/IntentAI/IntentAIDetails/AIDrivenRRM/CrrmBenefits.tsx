import { useIntl } from 'react-intl'

import { TrendTypeEnum }                                  from '@acx-ui/analytics/utils'
import { Card, GridCol, GridRow, ProcessedCloudRRMGraph } from '@acx-ui/components'

import { EnhancedRecommendation } from '../../IntentAIForm/services'
import { getGraphKPI }            from '../../RRMGraph'
import {
  BenefitsBody,
  BenefitsHeader,
  BenefitsValue,
  DetailsHeader,
  DetailsWrapper,
  TrendPill
} from '../styledComponents'

export const CrrmBenefits = ({ details, crrmData }:
  { details: EnhancedRecommendation, crrmData: ProcessedCloudRRMGraph[] }) => {
  const { $t } = useIntl()
  const { interferingLinks, linksPerAP } = getGraphKPI(details as EnhancedRecommendation, crrmData)

  return <>
    <DetailsHeader>{$t({ defaultMessage: 'Benefits' })}</DetailsHeader>
    <DetailsWrapper>
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
  </>
}
