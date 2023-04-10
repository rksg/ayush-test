import { css } from 'styled-components/macro'

export const Styles = css`
  .ant-descriptions-view .ant-descriptions-item-container {
      .ant-descriptions-item-label,
      .ant-descriptions-item-content {
        font-size: var(--acx-body-4-font-size);
        line-height: var(--acx-body-4-line-height);
        color: var(--acx-neutrals-90);
      }
  }

  .flexDescriptions .ant-descriptions-item-container .ant-descriptions-item-content {
    color: var(--acx-neutrals-60);
  }
`