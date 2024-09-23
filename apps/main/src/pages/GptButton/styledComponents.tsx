import {
  Button as AntButton
} from 'antd'
import styled from 'styled-components/macro'


const Button = styled(AntButton).attrs({ type: 'primary' })`
  &&& {
    background-color: var(--acx-neutrals-10);
    border: none;
    &:hover, &:focus {
      border-color: var(--acx-accents-orange-55);
      background-color: var(--acx-accents-orange-55);
    }
    > svg {
      width: 16px;
      height: 100%;
    }
  }
`

export const ButtonSolid = styled(Button)`
  > svg {
    /* transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1); */
  }
  &:hover, &:focus {
    > svg {
      stroke: var(--acx-accents-orange-55);
    }
  }
`
