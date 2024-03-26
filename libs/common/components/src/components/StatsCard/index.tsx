import { MessageDescriptor, useIntl, defineMessage } from 'react-intl'

import {
  Wrapper,
  Statistic,
  ContentWrapper,
  Type,
  Title,
  Divider,
  Link }    from './styledComponents'

export interface StatsCardProps {
  type: Type
  title?: MessageDescriptor
  values: {
    title: MessageDescriptor
    value: string
    suffix?: string
  } []
  isOpen?: boolean
  onClick?: () => void
}

export const StatsCard = (props: StatsCardProps) => {
  const { $t } = useIntl()
  const { type, values, title, onClick, isOpen } = props
  const card = <Wrapper $type={type}>
    {
      title && <Title $type={type}>{$t(title)}</Title>
    }
    <ContentWrapper>
      {
        values.map((value, index) => (
          <>
            <Statistic
              style={{ width: `${100 / values.length}%` }}
              $type={type}
              title={$t(value.title)}
              value={value.value}
              suffix={value.suffix}
            />
            { index < values.length - 1 && <Divider type='vertical' $color={type}/>}
          </>
        ))
      }
    </ContentWrapper>

    {
      onClick && <Link $type={type} onClick={onClick} $disabled={isOpen}>
        {`(${$t(defineMessage({ defaultMessage: 'More details' }))})`}
      </Link>
    }
  </Wrapper>
  return card
}

