import { css } from 'styled-components/macro'

export const styles = css`
  .vertical-form-item {
    .ant-form-item-row {
      flex-direction: column;
      .ant-form-item-label {
        text-align: left;
      }
      .ant-form-item-control {
        flex: 1 1 auto;
      }
    }
  }
`

