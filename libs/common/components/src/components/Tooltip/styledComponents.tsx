import { createGlobalStyle } from 'styled-components/macro'

export const TooltipGlobalStyle = createGlobalStyle`
  .ant-tooltip {
    font-size: var(--acx-body-4-font-size); 
    line-height: var(--acx-body-4-line-height);
    filter: drop-shadow(0px 4px 8px rgba(51, 51, 51, 0.08));

    &-arrow {
      &-content { box-shadow: none; }
    }
    &-inner {
      padding: 8px 8px;
      box-shadow: none;
      white-space: pre-line;

      > :last-child {
        margin-bottom: 0;
      }
    }

    ul {
      padding-inline-start: 15px;
    }
  }

  .ant-spin {
    &.ant-spin-sm {
      .ant-spin-dot {
        font-size: 12px;
      }
    }
  }
`
