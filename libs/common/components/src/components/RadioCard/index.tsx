import { ReactNode } from 'react'

import { ButtonProps, RadioProps }                   from 'antd'
import { MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { SmartEdgeSolid, SwitchSolid, WiFi } from '@acx-ui/icons'
import { RadioCardCategory }                 from '@acx-ui/types'

import { getTitleWithIndicator } from '../BetaIndicator'
import { Tooltip }               from '../Tooltip'

import {
  Button, Radio, Card, Title, Description,
  Category, CategoryWrapper, CategoryIcon,
  RadioCardType
} from './styledComponents'

export type RadioCardProps = RadioProps & {
  type?: RadioCardType
  title: string | ReactNode,
  description: string
  value: string
  categories?: RadioCardCategory[]
  categoryDisplayMode?: 'text' | 'icon'
  buttonText?: MessageDescriptor,
  buttonProps?: ButtonProps,
  onClick?: () => void
  isBetaFeature?: boolean
  helpIcon?: React.ReactNode
  disabledTooltip?: React.ReactNode
}

export const categoryMapping = {
  [RadioCardCategory.WIFI]: {
    text: defineMessage({ defaultMessage: 'Wi-Fi' }),
    color: '--acx-accents-blue-60'
  },
  [RadioCardCategory.SWITCH]: {
    text: defineMessage({ defaultMessage: 'Switch' }),
    color: '--acx-semantics-green-60'
  },
  [RadioCardCategory.EDGE]: {
    text: defineMessage({ defaultMessage: 'RUCKUS Edge' }),
    color: '--acx-semantics-yellow-60'
  }
}

const categoryIconMapping = {
  wifi: WiFi,
  switch: SwitchSolid,
  edge: SmartEdgeSolid
}

export function RadioCard ({
  type = 'default', title, description, value, categories = [], categoryDisplayMode = 'text',
  buttonText, buttonProps = {}, onClick, isBetaFeature, helpIcon, disabledTooltip, ...rest
}: RadioCardProps) {

  const radioCard = <Card $cardType={type} onClick={type === 'default' ? onClick : undefined}>
    <Title>
      { isBetaFeature ? getTitleWithIndicator(title as string) : title }
      { helpIcon }
    </Title>
    <Description>{description}</Description>
    <CategoryViewer categories={categories} categoryDisplayMode={categoryDisplayMode} />
    <ActionButton
      type={type}
      buttonText={buttonText}
      buttonProps={buttonProps}
      onClick={onClick}
    />
    {type === 'radio' && <Radio value={value} {...rest}/>}
  </Card>

  return disabledTooltip
    ? <Tooltip title={disabledTooltip} >{radioCard}</Tooltip>
    : radioCard
}

function CategoryViewer (
  props: { categories: RadioCardCategory[], categoryDisplayMode: 'text' | 'icon' }
) {
  const { categories, categoryDisplayMode } = props
  const { $t } = useIntl()

  if (categories.length === 0 ) return null

  return <CategoryWrapper>{categories.map(category=> {
    const set = categoryMapping[category]

    if (categoryDisplayMode === 'text') {
      return set && <Category key={category} color={set.color}>{$t(set.text)}</Category>
    }

    const Icon = categoryIconMapping[category]
    return set && Icon && <CategoryIcon key={category} color={set.color}>
      <Tooltip title={$t(set.text)}><Icon width={16} height={16} key={category} /></Tooltip>
    </CategoryIcon>
  })}
  </CategoryWrapper>
}

type ActionButtonProps = Pick<RadioCardProps, 'type' | 'buttonText' | 'buttonProps' | 'onClick'>
function ActionButton (props: ActionButtonProps) {
  const { type, buttonText, buttonProps, onClick } = props
  const { $t } = useIntl()

  if (type !== 'button' || !buttonText) return null

  return <Button
    {...buttonProps}
    onClick={onClick}
    size='small'
    type='primary'
  >{$t(buttonText)}</Button>
}

RadioCard.Radio = Radio
RadioCard.Category = Category
RadioCard.CategoryWrapper = CategoryWrapper
