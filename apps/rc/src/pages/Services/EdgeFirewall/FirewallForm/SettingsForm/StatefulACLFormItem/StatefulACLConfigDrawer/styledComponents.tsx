import styled from 'styled-components/macro'

import { cssStr } from '@acx-ui/components'
import { Drag }   from '@acx-ui/icons'

// color: #6e6e6e;
export const DragIcon = styled(Drag)`
  cursor: grab;
 `

interface DragIconWrapperProps extends React.PropsWithChildren {
  disabled?: boolean;
  'data-testid'?: string;
}

export const DragIconWrapper = styled.div<DragIconWrapperProps>`
  text-align: center;
  pointer-events: ${(props) => props.disabled && 'none'};
  cursor: ${(props) => props.disabled && 'none'};
  & svg > path {
    fill: ${(props) => props.disabled ? cssStr('--acx-neutrals-40') : cssStr('--acx-neutrals-70')};
  }
`