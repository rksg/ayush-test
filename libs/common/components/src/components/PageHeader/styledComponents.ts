import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  position: sticky;
  top: calc(var(--acx-header-height) + var(--acx-content-vertical-space));
  z-index: 3;
  background-color: var(--acx-neutrals-10);

  .ant-page-header {
    padding: 0;
    &-heading {
      h1 {
        margin-bottom: 0;
      }
      &-left{
        overflow: visible;
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
        overflow: visible;
      }
      margin-bottom: var(--acx-content-vertical-space);
    }
    .ant-breadcrumb + .ant-page-header-heading {
      margin-top: 6px;
    }
    &.has-footer {
      .ant-page-header-heading {
        margin-bottom: 0;
      }
    }
    &-footer {
      margin-top: 6px;
      .ant-tabs {
        border-bottom: 1px solid var(--acx-neutrals-30);
        .ant-tabs-tab {
          padding: 4px 0 14px 0;
          &.ant-tabs-tab-active .ant-tabs-tab-btn {
            font-weight: var(--acx-subtitle-4-font-weight);
          }
        }
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
