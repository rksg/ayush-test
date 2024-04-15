import styled from 'styled-components'

export const Container = styled.div<{ incidentCount: number }>`
  width: 100%;
  height: 100%;
  svg {
    cursor: ${(props) => props.incidentCount > 0 ? 'pointer' : 'auto'}
  }
`