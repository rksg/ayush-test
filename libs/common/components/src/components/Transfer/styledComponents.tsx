/* eslint-disable max-len */
import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const Title = styled.div`
  line-height: var(--acx-subtitle-4-line-height);
  font-size: var(--acx-subtitle-4-font-size);
  font-weight: var(--acx-subtitle-4-font-weight);
`

export const SelectedCount = styled.div`
  line-height: var(--acx-body-5-line-height);
  font-size: var(--acx-body-5-font-size);
  color: var(--acx-accents-blue-50);
`

export const TransferLayout = styled(Space)`
  .ant-transfer-list {
    border: 0;
    &:last-child {
      .ant-transfer-list-body-search-wrapper {
        display: none;
      }
      .ant-transfer-list-body-not-found {
        height: calc(100%);
      }
    }
  }
  .ant-transfer-list-header {
    border: 0;
    padding: 0;
    margin-bottom: 4px;
    height: auto;
  }
  .ant-transfer-list-body-search-wrapper {
    padding: 0 0 4px;
    .ant-transfer-list-search {
      border: 1px solid var(--acx-neutrals-40) !important;
      padding: 0 8px;
      height: 24px;
      .ant-input-prefix {
        margin-right: 8px;
        span[role=img] {
          svg { display: none; }
          &::after {
            content: '';
            display: inline-block;
            width: 16px;
            height: 16px; 
            background-color: var(--acx-primary-black);
            // encodeURIComponent(renderToStaticMarkup(<SearchOutlined />))
            mask: url("data:image/svg+xml,%3Csvg%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7.25%2012.5C10.1495%2012.5%2012.5%2010.1495%2012.5%207.25C12.5%204.35051%2010.1495%202%207.25%202C4.35051%202%202%204.35051%202%207.25C2%2010.1495%204.35051%2012.5%207.25%2012.5Z%22%20stroke%3D%22%23333333%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M10.9609%2010.9609L13.9985%2013.9985%22%20stroke%3D%22%23333333%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E");
            -webkit-mask: url("data:image/svg+xml,%3Csvg%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7.25%2012.5C10.1495%2012.5%2012.5%2010.1495%2012.5%207.25C12.5%204.35051%2010.1495%202%207.25%202C4.35051%202%202%204.35051%202%207.25C2%2010.1495%204.35051%2012.5%207.25%2012.5Z%22%20stroke%3D%22%23333333%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M10.9609%2010.9609L13.9985%2013.9985%22%20stroke%3D%22%23333333%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E");
            mask-size: 16px 16px;
            -webkit-mask-size: 16px 16px;
          }
        }
      }
      .ant-input {
        font-size: var(--acx-body-4-font-size);
        ::placeholder {
          font-style: italic;
        }
      }
    }
  }
  .ant-transfer-list-content {
    border: 1px solid var(--acx-neutrals-40);
    border-radius: 4px;
    padding: 8px 0;
    .ant-transfer-list-checkbox {
      display: none;
    }
    .ant-transfer-list-content-item {
      min-height: 24px;
      padding: 4px 8px;
      font-size: var(--acx-body-4-font-size);
      line-height: var(--acx-body-4-line-height);
      &:hover {
        background-color: var(--acx-accents-orange-10);
      }
      &.ant-transfer-list-content-item-checked {
        background-color: var(--acx-accents-orange-20);
      }
    }
  }

  .ant-transfer-list-body-not-found {
    flex: auto;
    height: calc(100% - 32px);
    border: 1px solid var(--acx-neutrals-40);
    border-radius: 4px;
    padding: 8px 0;
    margin: 0;
    .ant-empty {
      display: none;
    }
  }
  .ant-transfer-operation {
    margin: 0 20px;
    .ant-btn {
      &:first-child {
        margin-bottom: 10px;
        background-color: var(--acx-accents-orange-50);
        border-color: var(--acx-accents-orange-50);
      }
      &:last-child {
        background-color: transparent;
        border-color: var(--acx-primary-black);
        color: var(--acx-primary-black);
        &:after {
          display: none;
        }
      }
    }
  }
`
