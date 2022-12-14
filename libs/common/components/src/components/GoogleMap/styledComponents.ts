import { Form } from 'antd'
import styled   from 'styled-components/macro'

export const MapContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  margin: 0;
  aspect-ratio: 470 / 260;
`

export const FormItem = styled(Form.Item)`
  .ant-form-item-control-input-content > *:first-child {
    position: absolute;
    z-index: 1;
    width: calc(100% - 24px);
    margin: 12px;
  }

  .ant-form-item-control > *:nth-child(2):not(.ant-form-item-extra) {
    padding: 1px 2px;
    width: fit-content;
    position: absolute;
    left: 12px;
    top: 48px;
    background-color: rgba(255, 255, 255, 0.9);
    > div {
      padding: 0
    }
  }

  .ant-form-item-extra {
    position: absolute;
    right: 0;
    top: -25px;
  }

  h3 {
    text-align: center;
    margin-top: 100px;
  }
`
