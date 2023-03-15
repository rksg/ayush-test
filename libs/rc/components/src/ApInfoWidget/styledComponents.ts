import { Space } from 'antd'
import styled    from 'styled-components/macro'

import { Card, DonutChart } from '@acx-ui/components'
import { TenantLink }       from '@acx-ui/react-router-dom'

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

export const TenantLinkBlack = styled(TenantLink)`
  color: var(--acx-primary-black);
  :hover {
    color: var(--acx-primary-black);
  }
`

export const TenantLinkSvg = styled(TenantLink)`
  svg {
    cursor: pointer
  }
`