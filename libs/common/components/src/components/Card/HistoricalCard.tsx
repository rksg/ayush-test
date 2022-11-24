import { useIntl } from 'react-intl'

import { Tooltip } from '../Tooltip'

import { Card, CardProps } from './Card'
import * as UI             from './styledComponents'

export type HistoricalCardProps = CardProps & {
  title?: string
}

export function HistoricalCard ({ title, ...props }: HistoricalCardProps) {
  const { $t } = useIntl()
  const customTitie = {
    title,
    icon: <Tooltip
      title={$t({ defaultMessage: 'Historical data is slightly delayed, and not real-time' })}>
      <UI.HistoricalOutlinedIcon />
    </Tooltip>
  }

  return <Card {...props} title={customTitie} />
}

HistoricalCard.Icon = UI.HistoricalOutlinedIcon
