
import { Button as AntButton } from 'antd'
import styled                  from 'styled-components/macro'



const Button = styled(AntButton).attrs({ type: 'primary' })`
  &&& {
    background-color: var(--acx-neutrals-10);
    border: none;
    &:hover, &:focus {
      border-color: var(--acx-accents-orange-10);
      background-color: var(--acx-accents-orange-10);
    }
    > svg {
      width: 20px;
      height: 100%;
    }
  }
`

export const ButtonSolid = styled(Button)`
  > svg {
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
  &:hover {
    > svg {
      stroke: var(--acx-accents-orange-55);
    }
  }
`
export const AiButton = styled.div`
height: 36px;
margin: -4px;
cursor: pointer;
svg {
  opacity: 0.95;
  width: 38px;
  height: 38px;
}
&:hover {
  > svg {
    opacity: 1;
}
`