import styled from 'styled-components/macro'

import { MobilePhoneOutlined } from '@acx-ui/icons'

export const FieldLabel = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  line-height: 32px;
  grid-template-columns: ${props => props.width} 1fr;
`
export const DescriptionWrapper = styled.div`
  .ant-form-item-control {
    display: none;
  }
`
export const MobilePhoneOutlinedIcon = styled(MobilePhoneOutlined)`
  height: 16px;
`
export const UserProfilePhoneNumberWrapper = styled.div`
  margin-top: -28px;
  margin-bottom: 16px;
  .ant-typography {
    margin: 0;
  }
  .ant-btn {
    font-size: 12px;
  }
`