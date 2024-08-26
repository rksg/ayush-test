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
      color: var(--acx-primary-black);
    }
  }

  &.ant-btn-link {
    svg { path {
      color: var(--acx-accents-blue-50);
    } }
    &:hover {
      color: var(--acx-accents-blue-60);
      svg {
        path {
          color: var(--acx-accents-blue-60);
        }
      }
    }
  }

  &.ant-btn-primary {
    svg { path {
      color: var(--acx-primary-white) !important;
    } }
  }

  &[disabled], &.ant-btn-disabled {
    svg { path { color: var(--acx-primary-white); } }

    &.ant-btn-link,
    &.ant-btn-default,
    &.ant-btn-primary {
      svg { path { color: var(--acx-neutrals-40); } }
    }
  }
`
