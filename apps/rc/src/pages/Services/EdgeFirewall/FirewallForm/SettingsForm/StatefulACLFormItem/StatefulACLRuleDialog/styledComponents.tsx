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

    label.ant-radio-wrapper.required {
        &::after {
            color: var(--acx-accents-orange-50);
            font-family: var(--acx-neutral-brand-font);
            font-size: var(--acx-body-4-font-size);
            line-height: var(--acx-body-4-line-height);
            overflow: visible;
            content: '*';
            margin-left: -5px;
        }
    }
  }

  .ant-modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

`