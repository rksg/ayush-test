import { css } from 'styled-components/macro'

export const WrapperStyles = css`
  width: 100%;
  height: 100%;

  .ant-statistic {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    align-items: center;

    .ant-statistic-title {
      color: var(--acx-primary-black);
      font-family: var(--acx-neutral-brand-font);
      font-size: var(--acx-subtitle-4-font-size);
      line-height: var(--acx-subtitle-4-line-height);
      font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
      white-space: normal;
    }
    .ant-statistic-content {
      .ant-statistic-content-value {
        font-size: 32px;
        font-weight: var(--acx-body-font-weight-bold);
      }
      .ant-statistic-content-value .ant-typography {
        color: inherit;
      }
      .ant-statistic-content-value .ant-typography.unit {
        font-size: 16px;
        font-weight: normal;
        margin-left: 3px;
      }
      .ant-statistic-content-suffix {
        font-size: var(--acx-body-2-font-size);
      }
    }
  }
`