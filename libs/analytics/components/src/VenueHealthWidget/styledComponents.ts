import { Space } from 'antd'
import styled    from 'styled-components/macro'

import { HistoricalCard } from '@acx-ui/components'

export const Wrapper = styled(Space)`
  justify-content: left;
  width: 100%;
  height: 100%;
`

export const HistoricalIcon = styled(HistoricalCard.Icon)`
  margin: 0px 0px -4px 4px;
`