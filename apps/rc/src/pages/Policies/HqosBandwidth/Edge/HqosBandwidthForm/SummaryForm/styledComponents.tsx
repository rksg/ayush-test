import { Descriptions as AntdDescriptions } from 'antd'
import styled                               from 'styled-components'

export const StyledAntdDescriptions = styled(AntdDescriptions)`
  .ant-descriptions-view .ant-descriptions-item-container {
      .ant-descriptions-item-label,
      .ant-descriptions-item-content {
        font-size: var(--acx-body-4-font-size);
        line-height: var(--acx-body-4-line-height);
      }
  }

  .ant-descriptions-item-container .ant-descriptions-item-label {
    color: var(--acx-neutrals-90);
  }

  .ant-descriptions-item-container .ant-descriptions-item-content {
    color: var(--acx-neutrals-60);
  }

  .ant-descriptions-row > th {
    padding-bottom: 0px;
  }
`