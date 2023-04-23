import { FlagFilled }  from '@ant-design/icons'
import styled, { css } from 'styled-components/macro'

export const StyledFlagFilled = styled(FlagFilled)`
  color: ${(props) => props.color || 'grey'};
 `

export const ModalStyles = css`
  .ant-radio-group{
    .ant-form-item {
      margin-bottom: 0;
    }
  }

  .ant-modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`