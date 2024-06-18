import { Space } from 'antd'
import styled    from 'styled-components/macro'

import { CheckMarkCircleSolid } from '@acx-ui/icons'

import type { NoDataWrapperProps } from '.'

export const NoDataWrapper = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  padding: 0 16px;
`
export const TextWrapper = styled(Space)`
  text-align: center;
  justify-content: center;
  width: 100%;
  .ant-empty-normal {
    margin: 0;
    margin-block-end: 17px;
  }
`
export const NoDataTextWrapper = styled(TextWrapper)`
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-body-4-font-weight);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  color: var(--acx-primary-black);
`
export const GreenTickIcon = styled(CheckMarkCircleSolid)<{
  $size: NoDataWrapperProps['tickSize']
}>`
  --size: ${({ $size }) => $size === 'default' ? '32px' : '48px'};
  height: var(--size);
  width: var(--size);
  margin-block-end: ${({ $size }) => $size === 'default' ? '0' : '13px'};
`

export const RollupText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: -webkit-fill-available;
`
