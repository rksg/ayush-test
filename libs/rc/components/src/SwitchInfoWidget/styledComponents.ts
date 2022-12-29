import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const Wrapper = styled(Space)`
  justify-content: center;
  width: 100%;
  height: 100%;
`

export const Container = styled.div`
  width: 100%;
  height: 100%;
  .ant-btn-link {
    background: transparent;
  }
`

export const ChartTopTitle = styled.span`
  color: var(--acx-primary-black);
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-subtitle-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
`

export const LargeText = styled.span`
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-2-font-size);
  font-weight: var(--acx-headline-2-font-weight-bold);
  line-height: var(--acx-headline-1-line-height);
  display: flex;
  align-items: baseline;
`