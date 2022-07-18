import { Button as AntButton } from 'antd'
import styled, { css }         from 'styled-components/macro'

export const Button = styled(AntButton)<{ $customType: string | null }>`
  ${props => props.$customType === 'secondary' ? css`
    background-color: var(--acx-accents-orange-50);
    border-color: var(--acx-accents-orange-50);
    &:hover, &:focus {
      background-color: var(--acx-accents-orange-60);
      border-color: var(--acx-accents-orange-60);
    }
  ` : ''}

  padding: 4px 12px;
  vertical-align: bottom;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-shadow: unset;
  box-shadow: unset;

  &.ant-btn-icon-only {
    padding-left: 0;
    padding-right: 0;
  }

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

  &[disabled] {
    svg { path { stroke: var(--acx-neutrals-10); } }

    &.ant-btn-default {
      color: var(--acx-neutrals-40);
      background-color: var(--acx-neutrals-10);
      svg { path { stroke: var(--acx-neutrals-40); } }
    }
  }

  &.ant-btn-link {
    padding: 0;
  }
`
