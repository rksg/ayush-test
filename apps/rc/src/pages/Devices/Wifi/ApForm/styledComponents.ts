import { Divider as AntDivider, Form } from 'antd'
import styled                          from 'styled-components/macro'

export const AddressFormItem = styled(Form.Item)`
  position: relative;
  margin: 0 !important;
  .ant-form-item-row {
    position: absolute;
    width: calc(100% - 24px);
    z-index: 1;
    margin: 12px;
  }
  .ant-form-item-explain {
    padding: 1px 2px;
    width: fit-content;
    background-color: rgba(255, 255, 255, 0.9);
  }
`

export const AddressMap = styled.div`
  position: relative;
  aspect-ratio: 470 / 260;
`

export const Divider = styled(AntDivider).attrs({ type: 'vertical' })`
  background: var(--acx-primary-black);
`