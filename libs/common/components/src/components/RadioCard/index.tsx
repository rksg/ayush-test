import { RadioProps }                                from 'antd'
import { MessageDescriptor, defineMessage, useIntl } from 'react-intl'

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
  title: string
  description: string
  value: string
  categories?: RadioCardCategory[]
  buttonText?: MessageDescriptor,
  onClick?: () => void
}

const categoryMapping = {
  wifi: {
    text: defineMessage({ defaultMessage: 'Wi-Fi' }),
    color: '--acx-accents-blue-60'
  },
  switch: {
    text: defineMessage({ defaultMessage: 'Switch' }),
    color: '--acx-semantics-green-60'
  },
  edge: {
    text: defineMessage({ defaultMessage: 'SmartEdge' }),
    color: '--acx-semantics-yellow-60'
  }
}

export function RadioCard ({
  type = 'default', title, description, value, categories = [], buttonText, onClick, ...rest
}: RadioCardProps){
  const { $t } = useIntl()
  return <Card $cardType={type} onClick={type === 'default' ? onClick : undefined}>
    <Title>{title}</Title>
    <Description>{description}</Description>
    { categories.length > 0 &&
      <CategoryWrapper>{categories.map(category=> {
        const set = categoryMapping[category]
        return set && <Category key={category} color={set.color}>{$t(set.text)}</Category>
      })}
      </CategoryWrapper>}
    {(type === 'button' && buttonText) &&
      <Button onClick={onClick} size='small' type='secondary'>{$t(buttonText)}</Button>}
    {type === 'radio' && <Radio value={value} {...rest}/>}
  </Card>
}
