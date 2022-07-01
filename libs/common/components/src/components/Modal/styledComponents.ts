import { Collapse as AntCollapse, Button } from 'antd'
import styled                              from 'styled-components/macro'

export const CustomTemplate = styled.div``

export const Content = styled.div`
  min-height: 43px;
`
export const Footer = styled.div`
  display: flex;
  margin-top: 24px;
`
export const FooterButtons = styled.div`
  position: absolute;
  right: 24px;
  .ant-btn + .ant-btn {
    margin-left: 8px;
  }
`

export const Collapse = styled(AntCollapse)`
  .ant-collapse-item {
    flex: 1;
    > .ant-collapse-content >.ant-collapse-content-box {
      display: flex;
      flex-direction: column;
      padding: 0;
      margin-top: 16px;
    }
    .ant-collapse-header {
      font-size: 12px;
      line-height: 16px;
      color: var(--acx-accents-blue-50);
      padding: 7px 0;
      flex-direction: row-reverse;
      justify-content: flex-end;
      .ant-collapse-arrow {
        position: unset;
        transform: none;
        margin-left: 5px;
      }
    }
  }
  
  pre {
    background: var(--acx-neutrals-5);
    border: 1px solid var(--acx-neutrals-30);
    border-radius: 4px;
    word-break: break-word;
    white-space: pre-wrap;
    font-size: 10px;
    line-height: 1.5;
    padding: 12px;
    max-height: 200px;
  }
`

export const CopyButton = styled(Button)`
  display: inline-flex;
  justify-content: flex-end;
  font-size: 10px;
  line-height: 16px;
  color: var(--acx-accents-blue-50);
  height: auto;
  padding: 0;
  margin: 4px 0 4px auto;
`