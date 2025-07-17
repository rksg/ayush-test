import styled from 'styled-components'

export const ProgressBarWrapper = styled.div<{
  height: number;
  width: number;
}>`
  display: flex;
  height: ${(props) => props.height}px;
  width: ${(props) => props.width}px;
  flex-direction: column;
  justify-content: space-around
`