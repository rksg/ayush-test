import { ReactNode } from 'react'

import { RadioProps }                                from 'antd'
import { MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { getTitleWithIndicator } from '../BetaIndicator'

import {
  Button,
  Radio,
  Card,
  Title,
  Description,
  Category,
  CategoryWrapper,
  RadioCardType
} from './styledComponents'

export enum RadioCardCategory {
  WIFI = 'wifi',
  SWITCH = 'switch',
  EDGE = 'edge',
}

export type RadioCardProps = RadioProps & {
  type?: RadioCardType
  title: string | ReactNode,
  description: string
  value: string
  categories?: RadioCardCategory[]
  buttonText?: MessageDescriptor,
  onClick?: () => void
  isBetaFeature?: boolean
  helpIcon?: React.ReactNode
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

export function RadioCard ({
  type = 'default', title, description, value, categories = [],
  buttonText, onClick, isBetaFeature, helpIcon, ...rest
}: RadioCardProps){
  const { $t } = useIntl()
  return <Card $cardType={type} onClick={type === 'default' ? onClick : undefined}>
    <Title>
      { isBetaFeature ? getTitleWithIndicator(title as string) : title }
      { helpIcon }
    </Title>
    <Description>{description}</Description>
    { categories.length > 0 &&
      <CategoryWrapper>{categories.map(category=> {
        const set = categoryMapping[category]
        return set && <Category key={category} color={set.color}>{$t(set.text)}</Category>
      })}
      </CategoryWrapper>}
    {(type === 'button' && buttonText) &&
      <Button onClick={onClick} size='small' type='primary'>{$t(buttonText)}</Button>}
    {type === 'radio' && <Radio value={value} {...rest}/>}
  </Card>
}

RadioCard.Radio = Radio
RadioCard.Category = Category
RadioCard.CategoryWrapper = CategoryWrapper
