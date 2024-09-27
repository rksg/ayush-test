import { Descriptions as AntDescriptions } from 'antd'
import styled, { css }                     from 'styled-components/macro'

import { DescriptionsProps } from '.'

export const descriptionsItemLabelAndContent = css`
  .ant-descriptions-item-label,
  .ant-descriptions-item-content {
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
  }

  .ant-descriptions-item-label {
    color: var(--acx-neutrals-60);
    &::after {
      top: unset;
      bottom: 0;
      margin: 0 0.25em 0 0;
    }
  }

  .ant-descriptions-item-content {
    color: var(--acx-primary-black);
  }
`

export const Descriptions = styled(AntDescriptions)<DescriptionsProps>`
  padding: calc(var(--acx-descriptions-space) / 2) 0;

  .ant-descriptions-row:last-child .ant-descriptions-item {
    padding-bottom: 0;
  }

  .ant-descriptions-item {
    ${descriptionsItemLabelAndContent}
    padding: 0;
    padding-bottom: ${props => props.noSpace
    ? 'calc(var(--acx-body-4-line-height) - var(--acx-body-4-font-size))'
    : 'var(--acx-descriptions-space)'};

    .ant-descriptions-item-container {
      align-items: baseline;

      .ant-descriptions-item-label {
        width: ${props => props.noSpace ? 'unset' : `${props.labelWidthPercent}%`};
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
