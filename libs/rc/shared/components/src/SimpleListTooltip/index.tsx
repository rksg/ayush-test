import { useIntl } from 'react-intl'

import { Tooltip } from '@acx-ui/components'

import { SimpleListUl } from './styledComponents'

export interface SimpleListTooltipProps {
  items: string[]
  displayText: string | number
  title?: string
  maximum?: number
  textForMore?: string
  isValueUnique?: boolean
}

export function SimpleListTooltip (props: SimpleListTooltipProps) {
  const { $t } = useIntl()
  const {
    items,
    displayText,
    title,
    maximum = 10,
    isValueUnique = true
  } = props

  const needDisplayMore = items.length > maximum
  const textForMore = $t(
    { defaultMessage: 'And {rest} More...' },
    { rest: needDisplayMore ? items.length - maximum : '' }
  )
  const displayedItems = items.slice(0, needDisplayMore ? maximum : items.length)
  const displayedComp = <SimpleListUl>
    {title ? <h4>{title}</h4> : null}
    {displayedItems.map((item, index) => <li key={isValueUnique ? item : index}>{item}</li>)}
    {needDisplayMore ? <li key={'keyForMore'}>{textForMore}</li> : null}
  </SimpleListUl>

  return (
    <Tooltip title={displayedComp}>{displayText}</Tooltip>
  )
}
