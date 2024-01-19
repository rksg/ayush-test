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
      ? `
      cursor: not-allowed;
      pointer-events: none;
      color: var(--acx-neutrals-50);
    `
      : `
      cursor: pointer;
      color: var(--acx-primary-black);
    `}
`
export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 500px;
  padding: 20px;
`
