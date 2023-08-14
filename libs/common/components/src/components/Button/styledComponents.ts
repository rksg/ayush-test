import { Button as AntButton } from 'antd'
import styled                  from 'styled-components/macro'

export const Button = styled(AntButton)`
  display: inline-flex;
  vertical-align: bottom;
  align-items: center;
  justify-content: center;
  gap: 8px;

  svg {
    &:before {
      content: 'a';
    }
    width: 16px;
    height: 16px;
    path {
      stroke: var(--acx-primary-black);
    }
  }

  &.ant-btn-primary {
    svg { path {
      stroke: var(--acx-primary-white) !important;
      fill: var(--acx-primary-white) !important;
    } }
  }

  &[disabled], &.ant-btn-disabled {
    svg { path { stroke: var(--acx-primary-white); } }

    &.ant-btn-default,
    &.ant-btn-primary {
      svg { path { stroke: var(--acx-neutrals-40); } }
    }
  }
`
