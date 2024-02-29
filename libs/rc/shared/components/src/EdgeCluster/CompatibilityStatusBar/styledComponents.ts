import { Space, Typography } from 'antd'
import styled                from 'styled-components/macro'

import { CheckMarkCircleSolid, FailedSolid } from '@acx-ui/icons'

import { CompatibilityStatusEnum } from '.'


export const CheckMarkIcon = styled(CheckMarkCircleSolid)`
  width: 16px;
  height: 16px;
`
export const FailedSolidIcon = styled(FailedSolid)`
  width: 16px;
  height: 16px;
  & circle {
    fill: var(--acx-semantics-red-50);
    stroke: var(--acx-semantics-red-50);
  }
`

export const Title = styled(Typography.Text)`
  &::after {
    content: ':';
    display: inline-block;
  }
`

type WrapperProps = {
  type: CompatibilityStatusEnum
}

export const AlertMessageWrapper = styled(Space)<WrapperProps>`
  color: ${props => props.type === CompatibilityStatusEnum.FAIL
    ? 'red'
    :'green'
};

  & span.ant-typography {
    color: inherit
  }
`