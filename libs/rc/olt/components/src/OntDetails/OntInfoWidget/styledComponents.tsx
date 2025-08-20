import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const InfoWrapper = styled(Space)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0px !important;
`

export const InfoTitle = styled.div`
  font-size: var(--acx-subtitle-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  font-weight: 600;
  color: var(--acx-primary-black);
`

export const InfoData = styled.div`
  font-size: var(--acx-headline-2-font-size);
  line-height: var(--acx-headline-2-line-height);
  font-weight: 600;
  font-family: var(--acx-chart-font);
  color: var(--acx-primary-black);
`