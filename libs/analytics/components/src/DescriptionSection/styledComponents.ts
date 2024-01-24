import {
  Descriptions as AntDescriptions,
  DescriptionsProps
} from 'antd'
import AutoSizer       from 'react-virtualized-auto-sizer'
import styled, { css } from 'styled-components/macro'

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
  .ant-descriptions-item-label {
    color: var(--acx-neutrals-60);
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
  }
  .ant-descriptions-item-content {
    color: var(--acx-primary-black);
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
    .ant-badge-status-dot { top: -1px; }
  }
`

export const FixedAutoSizer = styled(AutoSizer)`
  position: fixed;
`
