import { Space, Typography } from 'antd'
import styled                from 'styled-components'

import { CheckMarkCircleSolid, FailedSolid } from '@acx-ui/icons'

import { TestConnectionStatusEnum } from './DirectoryServerSettingForm'


export const StyledSpace = styled(Space)`
  width: 100%;
  margin-bottom: var(--acx-descriptions-space);
  justify-content: space-between;
  align-items: baseline;
  & .ant-form-item {
      margin: 0;
  }
`

export const FormItemWrapper = styled.div`
  & .ant-form-item-control {
      display: none;
  }
`
export const CheckMarkIcon = styled(CheckMarkCircleSolid)`
  width: 18px;
  height: 18px;
`

export const FailedSolidIcon = styled(FailedSolid)`
  width: 18px;
  height: 18px;
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
  type: TestConnectionStatusEnum
}

export const AlertMessageWrapper = styled(Space)<WrapperProps>`
  display: flex;
  height: 32px;
  color: ${props => props.type === TestConnectionStatusEnum.FAIL
    ? 'red'
    :'green'
};

  & span.ant-typography {
    color: inherit
  }

  & .ant-space-item {
    display: flex;
  }
`
