import { Space } from 'antd'
import styled    from 'styled-components/macro'

import { Card, DonutChart } from '@acx-ui/components'

export const PointerContainer = styled.div`
  cursor: pointer;
`

export const Title = styled(Card.Title)`
  height: unset;
`

export const Wrapper = styled(Space)`
  justify-content: left;
  width: 100%;
  height: 100%;
`

export const DonutChartWidget = styled(DonutChart)`
  svg {
    cursor: pointer
  }
`