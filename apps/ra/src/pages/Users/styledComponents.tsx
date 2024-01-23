import { Space } from 'antd'
import styled    from 'styled-components'

import { DeleteOutlined } from '@acx-ui/icons'
export const Actions = styled(Space)`
  .ant-picker-suffix {
    margin: 0 !important;
  }
`
export const IconWrapper = styled.span<{ $disabled?: boolean }>`
  ${(props) =>
    props.$disabled
      ? `
      cursor: not-allowed;
    `
      : `
      cursor: pointer;
    `}
`
export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 500px;
  padding: 20px;
`
export const DeleteOutlinedDisabledIcon = styled(DeleteOutlined)`
  path {
    stroke: var(--acx-neutrals-40) !important;
  }
`
