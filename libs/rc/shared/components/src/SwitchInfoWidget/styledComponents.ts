import { Space } from 'antd'
import styled    from 'styled-components/macro'

import { DonutChart }        from '@acx-ui/components'
import { Client, PoeUsage  } from '@acx-ui/icons'
import { TenantLink }        from '@acx-ui/react-router-dom'

export const Wrapper = styled(Space)`
  justify-content: center;
  width: 100%;
  height: 100%;
`

export const PoeUsageIcon = styled(PoeUsage)`
  height: 30px;
  width: 30px;

  ${({ className }) => className === 'disconnected' && `
    path:last-child {
      stroke: var(--acx-neutrals-60);
      fill: var(--acx-neutrals-60);
    }
  `}
`

export const ClientIcon = styled(Client)`
  ${({ className }) => className === 'disconnected' && `
    path {
      fill: var(--acx-neutrals-60);
    }
  `}
`

export const Container = styled.div`
  width: 100%;
  height: 100%;
`

export const ChartTopTitle = styled.span`
  color: var(--acx-primary-black);
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-subtitle-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  font-weight: var(--acx-subtitle-5-font-weight-semi-bold);

  ${({ className }) => className === 'disconnected' && `
    color: var(--acx-neutrals-60);
  `}  
`

export const LargeText = styled.span`
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-2-font-size);
  font-weight: var(--acx-headline-2-font-weight-bold);
  line-height: var(--acx-headline-1-line-height);
  display: flex;
  align-items: baseline;
  min-height: 38px;
`

export const DisconnectedText = styled.span`
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-body-5-font-size);
  font-weight: var(--acx-body-font-weight);
  line-height: var(--acx-body-5-line-height);
  color: var(--acx-neutrals-60);
  display: flex;
  align-items: baseline;
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
