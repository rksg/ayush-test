import { Button as AntButton } from 'antd'
import styled, { css }         from 'styled-components/macro'

export const Button = styled(AntButton)<{ href?: string }>`
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

  ${props => props.href? css`
    &.ant-btn-default{
      padding-top: 4px !important;
    }
    &.ant-btn-disabled {
      color: var(--acx-neutrals-40) !important;
      background-color: var(--acx-primary-white) !important;
      border-color: var(--acx-neutrals-40) !important;
      svg { path {
        stroke: var(--acx-neutrals-40);
      } }
    }
  `: ''}

  &.ant-btn-primary {
    svg { path {
      stroke: var(--acx-primary-white) !important;
      fill: var(--acx-primary-white) !important;
    } }
  }

  &[disabled] {
    svg { path { stroke: var(--acx-primary-white); } }

    &.ant-btn-default,
    &.ant-btn-primary {
      svg { path { stroke: var(--acx-neutrals-40); } }
    }
  }
`
