import styled from 'styled-components/macro'

export const Diagram = styled.img<{ $vertical?: boolean }>`
  ${props => props.$vertical
    ? 'width: 290px;'
    : 'width: auto'}
`