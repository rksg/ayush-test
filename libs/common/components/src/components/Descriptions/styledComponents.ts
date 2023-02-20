import { Descriptions as AntDescriptions } from 'antd'
import styled                              from 'styled-components/macro'

import { DescriptionsProps } from '.'

export const Descriptions = styled(AntDescriptions)<DescriptionsProps>`
  padding: calc(var(--acx-descriptions-space) / 2) 0;

  .ant-descriptions-row:last-child .ant-descriptions-item {
    padding-bottom: 0;
  }

  .ant-descriptions-item {
    padding: 0;
    padding-bottom: var(--acx-descriptions-space);

    .ant-descriptions-item-container {
      align-items: baseline;

      .ant-descriptions-item-label,
      .ant-descriptions-item-content {
        font-size: var(--acx-body-4-font-size);
        line-height: var(--acx-body-4-line-height);
      }

      .ant-descriptions-item-label {
        width: ${props => props.labelWidthPercent}%;
        color: var(--acx-neutrals-60);
      }

      .ant-descriptions-item-content {
        display: unset;
      }
    }
  }
`

export const NoLabel = styled.div`
  width: 100%;
`
