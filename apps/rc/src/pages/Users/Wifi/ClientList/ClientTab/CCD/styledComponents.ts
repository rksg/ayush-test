import { Button as AntButton } from 'antd'
import styled                  from 'styled-components/macro'

export const Button = styled(AntButton)`
  display: inline-flex;
  vertical-align: bottom;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  &:hover {
    background: white;
  }

  svg {
    &:before {
      content: 'a';
    }
    path {
      stroke: var(--acx-primary-black);
    }
  }

  &[disabled] {
    svg { path { stroke: var(--acx-primary-white); } }

    &.ant-btn-default,
    &.ant-btn-primary,
    &.ant-btn-text {
      svg { path { stroke: var(--acx-neutrals-40); } }
    }
  }
`
