import { Button } from 'antd'
import { Form }   from 'antd'
import styled     from 'styled-components/macro'

export const NotificationBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  gap: 4px;
  background: #FEF6ED;
  border-radius: 8px;
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-subtitle-6-font-weight);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  color: var(--acx-primary-black);
`


export const LinkButton = styled(Button)`
  border-color: var(--acx-neutrals-50) !important;
  border: 1px solid;
  text-align: start;
  padding: 2px 12px;
  width: 528px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:hover {
    color: var(--acx-accents-blue-50) !important;
  }
`
export const OverwriteFormItem = styled(Form.Item)`
  .ant-form-item-label > label {
    line-height: var(--acx-subtitle-4-line-height);
    font-size: var(--acx-subtitle-4-font-size);
    font-family: var(--acx-neutral-brand-font);
    font-weight: var(--acx-subtitle-4-font-weight);
    color: var(--acx-primary-black);
  }
  .ant-form-item-label > label::after {
    content: '';
  }
  .ant-form-item-row {
    display: block !important ;
  }
`
export const FormItemNormal = styled(Form.Item)`
  .ant-form-item-label > label::after {
    content: '';
  }
  .ant-form-item-row {
    display: block !important ;
  }
`

export const DisclaimerContainer = styled.div`
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  font-weight: var(--acx-body-font-weight);
`
export const PrerequisiteTitle = styled.span`
  line-height: var(--acx-subtitle-4-line-height);
  font-size: var(--acx-subtitle-4-font-size);
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-subtitle-4-font-weight);
`