import { Space } from 'antd'
import styled    from 'styled-components/macro'

import { CheckMarkCircleSolid } from '@acx-ui/icons'

export const NoDataWrapper = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`

export const TextWrapper = styled(Space)`
  text-align: center;
  justify-content: center;
  width: 100%;
`

export const NoDataTextWrapper = styled(TextWrapper)`
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-subtitle-4-font-weight);
  font-size: var(--acx-subtitle-4-font-size);
  line-height: var(--acx-subtitle-4-line-height);
  color: var(--acx-neutrals-60);
`

export const NoActiveTextWrapper = styled(TextWrapper)`
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-body-3-font-size);
  font-weight: var(--acx-body-font-weight);
  line-height: var(--acx-body-3-line-height);
  color: var(--acx-primary-black);
`

export const GreenTickIcon = styled(CheckMarkCircleSolid)`
  height: 32px;
  width: 32px;
`