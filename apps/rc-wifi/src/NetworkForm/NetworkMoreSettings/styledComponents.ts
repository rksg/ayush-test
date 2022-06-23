import { Checkbox, Form, Collapse } from 'antd'
import styled                       from 'styled-components/macro'

export const FieldLabel = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  float: left;
  width: ${props => props.width};
`
export const CheckboxWrapper = styled(Checkbox)`
  margin-right: 5px;
`

export const FormItemNoLabel = styled(Form.Item)`
  margin-bottom: 5px;
`
export const Label = styled.span`
  font-size: var(--acx-body-4-font-size);
`

export const CollpasePanel = styled(Collapse)`
  &.ant-collapse-icon-position-end
    > .ant-collapse-item {
      > .ant-collapse-header {
        border-bottom: 1px solid var(--acx-neutrals-20);
        padding: 15px 0px 5px 0px;
        font-size: var(--acx-body-2-font-size);
        font-weight: 600;
        fontFamily: cssStr('--acx-neutral-brand-font');
      }
      & .ant-collapse-arrow {
        right: 10px;
        top: 65%;
      }
    }

   &.ant-collapse-ghost
     > .ant-collapse-item
       > .ant-collapse-content
         > .ant-collapse-content-box {
           padding-left: 85px;
         }
`

