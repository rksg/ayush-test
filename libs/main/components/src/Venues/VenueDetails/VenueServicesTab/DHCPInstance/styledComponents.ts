import { Select, Form, Switch } from 'antd'
import styled                   from 'styled-components/macro'


export const Wrapper = styled.section`
  ol {
    padding: 0;
    margin-bottom: 0;
  }
  li {
    list-style-position: inside;
    margin-block-end: 1em;
  }
`

export const AntSelect = styled(Select)`
    width: 250px !important;
`
export const AddBtnContainer = styled.div`
    width: 250px;
`
const gatewayBottom = '10px'
export const IconContainer = styled.div`
    display: flex;
    margin-bottom: ${gatewayBottom};
    align-items: center;
`
export const StyledForm = styled(Form)`
  .ant-form-item {
    margin-bottom: ${gatewayBottom};
  }
`
export const ReadonlySwitch = styled(Switch)`
  opacity: 0.5;
`
export const DisabledLabel = styled.span`
  color: var(--acx-neutrals-50);
`
