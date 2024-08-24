import { Fragment } from 'react'

import { MessageDescriptor, useIntl, defineMessage } from 'react-intl'

import { Tooltip } from './../Tooltip'
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
  tooltipMsg?: MessageDescriptor
  tooltipStyle?: string
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
  const { type, values, title, onClick, isOpen, tooltipMsg, tooltipStyle } = props
  const card = <Wrapper $type={type}>
    {
      title && <Title $type={type}>{$t(title)}</Title>
    }
    <ContentWrapper>
      {
        values.map((value, index) => (
          <Fragment key={`statsCardContent${index}`}>
            <Statistic
              style={{ width: `${100 / values.length}%` }}
              $type={type}
              title={<>{$t(value.title)}
                {tooltipMsg && <Tooltip.Info className={tooltipStyle}
                  key={`statsCardContent-tooltip${index}`}
                  placement='top'
                  title={$t(tooltipMsg)} />}
              </>}
              value={value.value}
              suffix={value.suffix}
            />
            { index < values.length - 1 && <Divider type='vertical' $color={type}/>}
          </Fragment>
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

