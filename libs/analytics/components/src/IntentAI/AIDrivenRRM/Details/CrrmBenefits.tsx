
import { useIntl } from 'react-intl'

import { Card, GridCol, GridRow, Loader, recommendationBandMapping } from '@acx-ui/components'

import { EnhancedRecommendation } from '../services'

import { useCRRMQuery } from './Graph/services'
import {
  BenefitsBadge,
  BenefitsBody,
  BenefitsHeader,
  BenefitsValue,
  DetailsHeader,
  DetailsWrapper
} from './styledComponents'
import { kpiBeforeAfter } from './Values'

export const CrrmBenefits = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()

  const interfering = kpiBeforeAfter(details, 'number-of-interfering-links')
  const interferingBefore = Number.parseInt(interfering.before, 10)
  const interferingAfter = Number.parseInt(interfering.after, 10)
  const band = recommendationBandMapping[details.code as keyof typeof recommendationBandMapping]
  const queryResult = useCRRMQuery(details, band)
  const impactedApsCount = queryResult.data?.length ? queryResult.data[1].nodes.length : 0
  const interferingPerApBefore = impactedApsCount === 0 ?
    0 : Math.round(((interferingBefore / impactedApsCount) + Number.EPSILON) * 10) / 10
  const interferingPerApAfter = impactedApsCount === 0 ?
    0 : Math.round(((interferingAfter / impactedApsCount) + Number.EPSILON) * 10) / 10

  const interferingImprovement = interferingBefore === 0 ? '0%' :
    `${((interferingAfter - interferingBefore) / interferingBefore) * 100}%`
  const interferingApImprovement = interferingPerApBefore === 0 ? '0%' :
    `${((interferingPerApAfter - interferingPerApBefore) / interferingPerApBefore) * 100}%`

  return <Loader states={[queryResult]}>
    <DetailsHeader>{$t({ defaultMessage: 'Benefits' })}</DetailsHeader>
    <DetailsWrapper>
      <GridRow>
        <GridCol col={{ span: 12 }}>
          <Card type='default'>
            <BenefitsHeader>{$t({ defaultMessage: 'Interfering links' })}</BenefitsHeader>
            <BenefitsBody data-testid='interfering-links'>
              <BenefitsValue>{interferingBefore}</BenefitsValue>
              <BenefitsBadge count={interferingImprovement}></BenefitsBadge>
            </BenefitsBody>
          </Card>
        </GridCol>
        <GridCol col={{ span: 12 }}>
          <Card type='default'>
            <BenefitsHeader>
              {$t({ defaultMessage: 'Average interfering links per AP' })}
            </BenefitsHeader>
            <BenefitsBody data-testid='interfering-links-per-ap'>
              <BenefitsValue>{interferingPerApBefore}</BenefitsValue>
              <BenefitsBadge count={interferingApImprovement}></BenefitsBadge>
            </BenefitsBody>
          </Card>
        </GridCol>
      </GridRow>
    </DetailsWrapper>
  </Loader>
}
