import React from 'react'

import { MessageDescriptor, useIntl } from 'react-intl'

import { Tooltip } from '@acx-ui/components'

import * as UI from './styledComponents'

export const Legend = (style: {
  [key: string]: {
    color: string,
    legendText: MessageDescriptor,
    tooltip: MessageDescriptor | null
  }
}) => {
  const { $t } = useIntl()
  return <UI.LegendWrapper>
    <UI.LegendItems>
      {Object.entries(style).map(([key, value]) => <React.Fragment key={key}>
        <UI.LegendSquare $color={value.color} />
        {value.tooltip ? <Tooltip title={$t(value.tooltip)}>
          <UI.LegendText>{$t(value.legendText)}</UI.LegendText>
        </Tooltip> : <UI.LegendText>{$t(value.legendText)}</UI.LegendText>}
      </React.Fragment>)}
    </UI.LegendItems>
  </UI.LegendWrapper>
}
