import styled from 'styled-components'

export const Container = styled.div<{ hasAccess: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  svg {
    cursor: ${(props) => props.hasAccess ? 'pointer' : 'auto'}
  }
`
