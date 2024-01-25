import { Space } from 'antd'
import styled    from 'styled-components'

export const Actions = styled(Space)`
  .ant-picker-suffix {
    margin: 0 !important;
  }
`
export const IconWrapper = styled.span<{ $disabled?: boolean }>`
  ${(props) =>
    props.$disabled
      ? 'cursor: not-allowed;'
      : 'cursor: pointer;'}
`
export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 500px;
  padding: 20px;
`