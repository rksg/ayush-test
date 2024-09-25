import {
  Descriptions as AntDescriptions,
  DescriptionsProps
} from 'antd'
import AutoSizer                          from 'react-virtualized-auto-sizer'
import styled, { css, createGlobalStyle } from 'styled-components/macro'

import { descriptionsItemLabelAndContent } from '@acx-ui/components'

export const withUrlStyle = css`
  cursor: pointer;
  color: var(--acx-accents-blue-50);
  &:hover {
    color: var(--acx-accents-blue-60);
    text-decoration: underline;
  }
  // below css will hide the default safari tooltip
  :after {
    content: '';
    display: block;
  }
`

export const TextContent = styled.span`${props => props.onClick ? css`
  ${withUrlStyle}
` : ''}`

export const Descriptions = styled(AntDescriptions)<DescriptionsProps>`
  .ant-descriptions-row > th {
    padding-bottom: 0;
  }
  .ant-descriptions-item {
    ${descriptionsItemLabelAndContent}
    .ant-descriptions-item-content {
      .ant-badge-status-dot { top: -1px; }
    }
  }
`

export const FixedAutoSizer = styled(AutoSizer)`
  position: fixed;
`

export const PopoverGlobalStyle = createGlobalStyle`
  .ant-popover {
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
    filter: drop-shadow(0px 4px 8px rgba(51, 51, 51, 0.08));

    &-arrow {

      &-content {
        box-shadow: none;
        background-color: var(--acx-primary-black);
        // Use linear gradient to mix box shadow of popover inner
        --antd-arrow-background-color: linear-gradient(
          to right bottom,
          fadeout(var(--acx-primary-black), 10%),
          var(--acx-primary-black)
        );
      }
    }
    &-inner {
      box-shadow: none;
      white-space: pre-line;
      min-width: 30px;
      min-height: 30px;
      max-height: 300px;
      overflow-y: scroll;
      color: var(--acx-primary-white);

      &-content {
        background-color: var(--acx-primary-black);
        border-radius: 4px;
        padding: 8px 8px;
        box-shadow: none;
        white-space: pre-line;
        min-width: 30px;
        min-height: 30px;
        color: var(--acx-primary-white);
      }

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

export const PopoverWrapper = styled.span`
  > span {
    text-decoration: dotted underline;
    :after {
      content: '';
      display: block;
    }
  }

`
