import { Select, Form } from 'antd'
import styled           from 'styled-components/macro'


export const RowWrapper = styled.div`
    padding: 20px;
    background: #ececec;
    border-radius: 6px;
`
export const AntSelect = styled(Select)`
    width: 250px !important;
`
export const AddBtnContainer = styled.div`
    width: 250px;
`
export const AntLabel = styled.label`
  color: var(--acx-neutrals-60);
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
