import { Button as AntButton } from 'antd'
import styled, { css }         from 'styled-components/macro'

export const Button = styled(AntButton)<{ $customType: string | null }>`
  ${props => props.type === 'primary' ? css`
    background-color: var(--acx-accents-orange-50);
    border-color: var(--acx-accents-orange-50);
    &:hover, &:focus {
      background-color: var(--acx-accents-orange-60);
      border-color: var(--acx-accents-orange-60);
    }
    &:active {
      background-color: var(--acx-accents-orange-50);
      border-color: var(--acx-accents-orange-60);
    }
    svg { path {
      stroke: var(--acx-primary-white) !important
      fill: var(--acx-primary-white) !important
    } }
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
    svg { path { stroke: var(--acx-primary-white); } }

    &.ant-btn-default {
      color: var(--acx-neutrals-40);
      background-color: var(--acx-primary-white);
      svg { path { stroke: var(--acx-neutrals-40); } }
    }

    &.ant-btn-link:not(.ant-btn-icon-only) {
      &, &:hover, &:focus {
        color: var(--acx-neutrals-40);
      }
    }
  }

  &.ant-btn-link:not(.ant-btn-icon-only) {
    padding: 0;
    height: var(--acx-body-3-line-height);

    &:hover, &:focus {
      color: var(--acx-accents-orange-50);
    }

    &.ant-btn-sm {
      height: var(--acx-body-4-line-height);
    }

    &.ant-btn-lg {
      height: var(--acx-body-2-line-height);
    }
  }

  &.ant-btn-background-ghost {
    border: 0;
  }
`
