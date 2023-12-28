import {
  Descriptions as AntDescriptions,
  DescriptionsProps
} from 'antd'
import AutoSizer       from 'react-virtualized-auto-sizer'
import styled, { css } from 'styled-components/macro'

import { withDottedUnderline } from '../IncidentTable/styledComponents'

export const TextContent = styled.span`${props => props.onClick ? css`
  ${withDottedUnderline}
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
