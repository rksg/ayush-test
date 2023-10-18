import styled from 'styled-components/macro'
import { Collapse as AcxCollapse } from '@acx-ui/components'

export const Collapse = styled(AcxCollapse)`
  width: 416px;
  border: 1px solid #E3E4E5;
  margin-top: 16px;
  padding: 10px;
  border-radius: 5px;
  .ant-collapse-content {
    background-color: var(--acx-primary-white) !important;
  }
  .ant-collapse-content-box {
    padding: 0px 2px 2px 2px;
  }
  .ant-collapse-item .ant-collapse-header {
    border-bottom: none !important;
    padding: 10px !important;
    font-size: 14px !important;
  }
`

export const Panel = styled(AcxCollapse.Panel)`
  .ant-collapse-header {
    padding: 13px 10px !important;
  }
  .ant-collapse-header > .ant-collapse-expand-icon > .ant-collapse-arrow {
    right: 18px !important;
  }
`

export const Wrapper = styled.div`
  border-radius: 8px;
  background: var(--acx-primary-white);
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
`
export const User = styled.div`
  width: 327px;
  height: auto;
  border: 1px solid #E3E4E5;
  border-radius: 5px;
  color: #333333;
  text-align: left;
  font-weight: 400;
  font-family: Open Sans;
  font-style: normal;
  font-size: 12px;
  line-height: 16px;
  margin-left: auto;
  margin-top: 16px;
  padding: 10px;
`
export const Bot = styled.div`
  width: 327px;
  height: auto;
  border: 1px solid #E3E4E5;
  border-radius: 5px;
  background: linear-gradient(0deg, #F7F7F7, #F7F7F7);
  color: #333333;
  ont-weight: 400;
  font-family: Open Sans;
  font-style: normal;
  font-size: 12px;
  line-height: 16px;
  margin-top: 16px;
  text-align: left;
  padding: 10px;
`
