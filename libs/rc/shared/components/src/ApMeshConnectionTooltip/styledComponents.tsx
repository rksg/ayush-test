
import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const Header = styled.h3`
  font-size: 10px;
  line-height: 16px;
  font-weight: 400;
  color: var(--acx-primary-white);
  opacity: 0.5;
`
export const Body = styled(Space).attrs({ size: 10, direction: 'vertical' })``

export const ItemContainer = styled(Space).attrs({ size: 5 })``

export const ItemLabel = styled.div`
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  color: var(--acx-primary-white);
  min-width: 80px;
`

export const ItemValue = styled.div<{ color?: string }>`
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${props => props.color ?? 'var(--acx-primary-white)'};
`
