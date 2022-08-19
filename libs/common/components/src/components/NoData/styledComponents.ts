import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const NoDataWrapper = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`

export const TextWrapper = styled(Space)`
  justify-content: center;
  width: 100%;
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-subtitle-4-font-weight);
  font-size: var(--acx-subtitle-4-font-size);
  line-height: var(--acx-subtitle-4-line-height);
  color: var(--acx-neutrals-60); 
`