import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  position: sticky;
  top: calc(var(--acx-header-height) + var(--acx-content-vertical-space));
  z-index: 5;
  background-color: var(--acx-primary-white);

  .ant-page-header {
    padding: 0;
    &-heading {
      h1 {
        margin-bottom: 0;
      }
      &-left {
        flex-direction: column;
      }
      &-sub-title {
        align-self: flex-start;
        margin-top: 6px;
        color: var(--acx-primary-black);
        font-size: var(--acx-body-4-font-size);
        line-height: var(--acx-body-4-line-height);
        font-weight: var(--acx-body-font-weight);
      }
      &-title {
        width: 100%;
        align-self: flex-start;
        display: flex;
        gap: 10px;
        align-items: center;
      }
      margin-bottom: var(--acx-content-vertical-space);
    }
    &-content {
      padding: 2px 0 4px 0;
      color: var(--acx-primary-black);
      font-size: var(--acx-body-4-font-size);
      line-height: var(--acx-body-4-line-height);
      font-weight: var(--acx-body-font-weight);
    }
    .ant-breadcrumb + .ant-page-header-heading {
      margin-top: 6px;
    }
    &.has-footer {
      .ant-page-header-heading {
        margin-bottom: 0;
      }
    }
    .ant-tabs-tab + .ant-tabs-tab {
      margin-left: 30px;
    }
  }
`

export const Spacer = styled.div`
  height: var(--acx-content-vertical-space);
`
