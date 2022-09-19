import { Form } from 'antd'
import styled   from 'styled-components/macro'

import { Close } from '@acx-ui/icons'

export const CloseIcon = styled(Close)`
  width: 10px;
  height: 10px;
  path {
    stroke: var(--acx-primary-black);
  }
`

export const AddressFormItem = styled(Form.Item)`
  .ant-input-affix-wrapper {
    position: absolute;
    z-index: 1;
    width: calc(100% - 24px);
    margin: 12px;
  }

  .ant-form-item-extra {
    position: absolute;
    right: 0;
    top: -25px;
  }

  .ant-form-item-explain {
    padding: 1px 2px;
    width: fit-content;
    position: absolute;
    left: 12px;
    top: 48px;
    background-color: rgba(255, 255, 255, 0.9);
  }
`

export const AddressMap = styled.div`
  position: relative;
  aspect-ratio: 470 / 260;

  h3 {
    text-align: center;
    margin-top: 100px;
  }
`
