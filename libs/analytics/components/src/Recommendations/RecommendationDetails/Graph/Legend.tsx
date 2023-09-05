import React from 'react'

import PropTypes   from 'prop-types'
import { useIntl } from 'react-intl'

import { bandwidthSizeMapping, categoryStyles } from '@acx-ui/components'
import { formatter }                            from '@acx-ui/formatter'

import * as UI from './styledComponents'

export const Legend = ({ bandwidths }: { bandwidths: string[] }) => {
  const { $t } = useIntl()
  return <UI.LegendsWrapper>
    <span>
      <UI.LegendTitle>{$t({ defaultMessage: 'Channel Bandwidth' })}</UI.LegendTitle>
      <UI.LegendWrapper>
        {bandwidths.map((bandwidth) => <React.Fragment key={bandwidth}>
          <UI.Circle $size={`${bandwidthSizeMapping[bandwidth]}px`} />
          <UI.LegendText>{`${formatter('bandwidthFormat')(bandwidth)}`}</UI.LegendText>
        </React.Fragment>)}
      </UI.LegendWrapper>
    </span>
    <span>
      <UI.LegendTitle>{$t({ defaultMessage: 'Transmit Power' })}</UI.LegendTitle>
      <UI.LegendWrapper>
        {Object.entries(categoryStyles).map(([key, value]) => <React.Fragment key={key}>
          <UI.Square $color={value.color} />
          <UI.LegendText>{$t(value.legendText)}</UI.LegendText>
        </React.Fragment>)}
      </UI.LegendWrapper>
    </span>
  </UI.LegendsWrapper>
}

Legend.propTypes = { bandwidths: PropTypes.arrayOf(PropTypes.string) }