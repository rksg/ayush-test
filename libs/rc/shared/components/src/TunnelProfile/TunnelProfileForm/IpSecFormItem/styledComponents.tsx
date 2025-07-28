import { Col, Space } from 'antd'
import styled         from 'styled-components'

export const StyledSpace = styled(Space)`
  width: 100%;
  margin-bottom: var(--acx-descriptions-space);
  justify-content: space-between;
  & .ant-form-item {
      margin: 0;
  }
`

export const IpSecFormOutline = styled.div`
    position: absolute;
    background: transparent;
    height: calc(100% - 20px);
    width: calc(100% + 20px);

    padding-left: 10px;
    margin-left: -10px;
    margin-top: 15px;
    border: 1px solid lightgrey;
    border-radius: 5px;
    padding-bottom: var(--acx-steps-form-actions-vertical-space);
    padding-right: 32px;
`

export const StyledTunnelEncryptionWrapper = styled(Col)`
  & .ant-form-item {
    background-color: white;
  }
`

export const StyledIpSecProfileViewWrapper = styled.div`
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 6px;
  border: 0px;
`