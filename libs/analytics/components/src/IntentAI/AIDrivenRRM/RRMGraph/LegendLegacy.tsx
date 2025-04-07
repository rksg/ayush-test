import React from 'react'

import { useIntl } from 'react-intl'

import { categoryStyles } from '@acx-ui/components'

import * as UI from './styledComponents'

export const Legend = () => {

  const { $t } = useIntl()
  return <UI.LegendWrapper>
    <UI.LegendTitle>{$t({ defaultMessage: 'Legend' })}</UI.LegendTitle>
    <UI.LegendItemsLegacy>
      {Object.entries(categoryStyles).map(([key, value]) => <React.Fragment key={key}>
        <UI.LegendSquare $color={value.color} />
        <UI.LegendText>{$t(value.legendText)}</UI.LegendText>
      </React.Fragment>)}
    </UI.LegendItemsLegacy>
  </UI.LegendWrapper>
}
