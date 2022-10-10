import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const Title = styled.span`
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-4-font-size);
  line-height: var(--acx-headline-4-line-height);
  color: var(--acx-primary-black);
  font-weight: var(--acx-headline-4-font-weight-bold);
`

export const Wrapper = styled(Space)`
  justify-content: left;
  width: 100%;
  height: 100%;
`

