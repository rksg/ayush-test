import { Space } from 'antd'
import styled    from 'styled-components/macro'

import { Card, HistoricalCard } from '@acx-ui/components'

export const Title = styled(Card.Title)`
  height: unset;
`

export const Wrapper = styled(Space)`
  justify-content: left;
  width: 100%;
  height: 100%;
`

export const HistoricalIcon = styled(HistoricalCard.Icon)`
  margin-bottom: -4px;
`