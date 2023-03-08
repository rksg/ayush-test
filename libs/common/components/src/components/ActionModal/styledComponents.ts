import { Collapse as AntCollapse } from 'antd'
import styled                      from 'styled-components/macro'

import { Button } from '../Button'

export const Content = styled.div`
  min-height: 43px;
`
export const Footer = styled.div`
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr;
`

export const FooterButtons = styled.div`
  grid-area: 1 / 1 / 1 / 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

export const Collapse = styled(AntCollapse)`
  grid-area: 1 / 1 / 1 / 1;
  .ant-collapse-item {
    flex: 1;
    > .ant-collapse-content >.ant-collapse-content-box {
      display: flex;
      flex-direction: column;
      padding: 0;
      margin-top: 16px;
    }
    > .ant-collapse-header {
      display: inline-flex;
      font-size: 12px !important;
      font-weight: var(--acx-body-font-weight) !important;
      line-height: 16px;
      color: var(--acx-accents-blue-50);
      padding: 7px 0 !important;
      flex-direction: row-reverse;
      justify-content: flex-end;
      border: 0 !important;
      .ant-collapse-arrow {
        position: unset;
        transform: none;
        margin-left: 5px;
      }
    }
  }

  textarea {
    background: var(--acx-neutrals-10);
    border: 1px solid var(--acx-neutrals-30);
    font-size: var(--acx-subtitle-6-font-size);
    line-height: var(--acx-subtitle-6-line-height);
    padding: 12px;
    max-height: 200px;
    resize: none;
    &:hover,
    &:focus {
      border-color: var(--acx-neutrals-30);
      box-shadow: none
    }
  }
`

export const CopyButton = styled(Button)`
  display: inline-flex;
  justify-content: flex-end;
  font-size: var(--acx-body-5-font-size);
  line-height: 16px;
  color: var(--acx-accents-blue-50);
  height: auto;
  padding: 0;
  margin: 4px 0 4px auto;
`
