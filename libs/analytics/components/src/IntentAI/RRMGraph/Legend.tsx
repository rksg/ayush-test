import React from 'react'

import { useIntl } from 'react-intl'

import { categoryStyles } from '@acx-ui/components'

import * as UI from './styledComponents'

export const Legend = ({ isDrawer }: { isDrawer: boolean }) => {
  const { $t } = useIntl()
  return <UI.LegendsWrapper style={{ paddingTop: isDrawer ? 20 : 0 }}>
    <span>
      <UI.LegendTitle>{$t({ defaultMessage: 'Legend' })}</UI.LegendTitle>
      <UI.LegendWrapper>
        {Object.entries(categoryStyles).map(([key, value]) => <React.Fragment key={key}>
          <UI.Square $color={value.color} />
          <UI.LegendText>{$t(value.legendText)}</UI.LegendText>
        </React.Fragment>)}
      </UI.LegendWrapper>
    </span>
  </UI.LegendsWrapper>
}
