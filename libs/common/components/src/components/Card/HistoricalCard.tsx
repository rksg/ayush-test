import { Card, CardProps } from './Card'
import * as UI             from './styledComponents'

export type HistoricalCardProps = CardProps & {
  title?: string
}

export function HistoricalCard ({ title, ...props }: HistoricalCardProps) {
  const customTitie = {
    title,
    icon: <UI.HistoricalOutlinedIcon />
  }

  return <Card {...props} title={customTitie} />
}
