import { Typography } from 'antd'
import styled         from 'styled-components/macro'

export const StyledFeatureName = styled(Typography.Text)`
  font-size: var(--acx-body-3-font-size);
  font-weight: var(--acx-body-font-weight-bold);
  color: var(--acx-primary-black);
  margin-bottom: 10px;
`

export const StyledDeviceTypeTitle = styled(Typography.Text)`
  font-size: var(--acx-body-2-font-size);
  font-weight: var(--acx-body-font-weight-bold);
  color: var(--acx-primary-black);
  margin-top: var(--acx-content-vertical-space);
  margin-bottom: var(--acx-content-vertical-space);
`

export const detailStyle = {
  fontSize: '13px',
  lineHeight: '13px',
  minHeight: '13px'
}

export const StyledWrapper = styled.div`
  .ApCompatibilityDrawerFormItem .ant-form-item-control-input {
    min-height: 13px;
  }
`