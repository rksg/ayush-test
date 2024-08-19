import { useIntl } from 'react-intl'

import { Card, GridCol, GridRow } from '@acx-ui/components'

import { DetailsSection } from '../../common/DetailsSection'

import { useValuesText } from './Values'

export const CrrmValuesExtra = () => {
  const { $t } = useIntl()
  const valuesText = useValuesText()
  return <GridRow>
    <GridCol col={{ span: 12 }}>
      <DetailsSection title={$t({ defaultMessage: 'Why this recommendation?' })}>
        <Card>{valuesText.reasonText}</Card>
      </DetailsSection>
    </GridCol>
    <GridCol col={{ span: 12 }}>
      <DetailsSection title={$t({ defaultMessage: 'Potential trade-off' })}>
        <Card>{valuesText.tradeoffText}</Card>
      </DetailsSection>
    </GridCol>
  </GridRow>
}
