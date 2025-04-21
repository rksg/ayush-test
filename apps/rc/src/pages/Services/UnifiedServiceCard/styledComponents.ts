import styled from 'styled-components'

export const RadioCardWrapper = styled.div<{ $readonly?: boolean }>`
  min-height: 135px;
  ${({ $readonly }) => ($readonly
    ? `pointer-events: none;`
    : '')}
`
