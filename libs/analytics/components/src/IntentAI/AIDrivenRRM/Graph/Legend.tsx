import React from 'react'

import PropTypes   from 'prop-types'
import { useIntl } from 'react-intl'

import { categoryStyles } from '@acx-ui/components'

import * as UI from './styledComponents'

export const Legend = () => {
  const { $t } = useIntl()
  return <UI.LegendsWrapper>
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
