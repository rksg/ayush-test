import { RadioProps }             from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import {
  Button,
  Radio,
  Card,
  Title,
  Description,
  Catogory,
  CatogoryWrapper,
  RadioCardType
} from './styledComponents'

export type RadioCardProps = RadioProps & {
  type?: RadioCardType
  title: string
  description: string
  value: string
  categories?: ('WiFi'|'Switch'|'Edge')[]
  onClick?: () => void
}

const catogoryMapping = {
  WiFi: {
    text: defineMessage({ defaultMessage: 'WiFi' }),
    color: '--acx-accents-blue-60'
  },
  Switch: {
    text: defineMessage({ defaultMessage: 'Switch' }),
    color: '--acx-semantics-green-60'
  },
  Edge: {
    text: defineMessage({ defaultMessage: 'Edge' }),
    color: '--acx-semantics-yellow-60'
  }
}

function RadioCard ({
  type = 'default', title, description, value, categories = [], onClick, ...rest
}: RadioCardProps){
  const { $t } = useIntl()
  return <Card cardtype={type} onClick={type === 'default' ? onClick : undefined}>
    <Title>{title}</Title>
    <Description>{description}</Description>
    { categories.length > 0 &&
      <CatogoryWrapper>{categories.map(category=> {
        const set = catogoryMapping[category]
        return set && <Catogory key={category} color={set.color}>{$t(set.text)}</Catogory>
      })}
      </CatogoryWrapper>}
    {type === 'button' &&
      <Button onClick={onClick} size='small' type='secondary'>
        {$t({ defaultMessage: 'Add' })}
      </Button>}
    {type === 'radio' && <Radio value={value} {...rest}/>}
  </Card>
}

export { RadioCard }
