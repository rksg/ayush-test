import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const LargePercent = styled.span`
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-1-font-size);
  font-weight: var(--acx-headline-2-font-weight-bold);
  line-height: var(--acx-headline-1-line-height);
  display: flex;
  margin-top: 10px;
  align-items: baseline;
`

export const Title = styled.span`
  color: var(--acx-primary-black);
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-subtitle-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
  text-align: left;
`

export const Wrapper = styled(Space)`
  width: 100%;
  height: 100%;
  justify-content: center;
`