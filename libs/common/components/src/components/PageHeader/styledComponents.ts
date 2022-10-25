import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  position: sticky;
  top: calc(var(--acx-header-height) + var(--acx-content-vertical-space));
  z-index: 5;
  background-color: var(--acx-primary-white);
  .ant-page-header {
    padding: 0;
    margin: 4px 0 var(--acx-content-vertical-space);
    &-heading {
      gap: 12px;
      h1 {
        margin-bottom: 0;
      }
      &-left {
        flex-direction: column;
        margin: 0;
      }
      &-extra {
        margin: 0;
      }
      &-title {
        width: 100%;
        align-self: flex-start;
        display: flex;
        gap: 10px;
        align-items: center;
      }
    }
    &-content {
      padding: 6px 0 0;
      color: var(--acx-primary-black);
      font-size: var(--acx-body-4-font-size);
      line-height: var(--acx-body-4-line-height);
      font-weight: var(--acx-body-font-weight);
    }
    .ant-breadcrumb + .ant-page-header-heading {
      margin-top: 3px;
    }
    &.has-footer {
      margin-bottom: 0;
      .ant-page-header-content {
        padding-bottom: 2px;
      }
      .ant-page-header-footer {
        margin-top: 8px;
      }
    }
  }
`

export const Spacer = styled.div`
  height: var(--acx-content-vertical-space);
`
