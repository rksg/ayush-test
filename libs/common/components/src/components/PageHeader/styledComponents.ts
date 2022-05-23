import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  position: sticky;
  top: calc(var(--acx-header-height) + var(--acx-content-vertical-space));
  z-index: 2;
  background-color: var(--acx-neutrals-5);

  .ant-page-header {
    padding: 0;
    .ant-breadcrumb + .ant-page-header-heading {
      margin-top: 6px;
    }
    &-heading {
      h1 {
        margin-bottom: 0;
      }
      &-left, &-title {
        overflow: visible;
      }
    }
    &-footer {
      margin-top: 6px;
      .ant-tabs {
        border-bottom: 1px solid var(--acx-neutrals-15);
        .ant-tabs-tab {
          padding: 4px 0 14px 0;
          &.ant-tabs-tab-active .ant-tabs-tab-btn {
            font-weight: 700;
          }
        }
      }
    }
  }
`
