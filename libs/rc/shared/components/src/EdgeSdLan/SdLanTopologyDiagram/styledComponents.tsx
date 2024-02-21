import styled from 'styled-components/macro'

export const Diagram = styled.img<{ $vertical?: boolean }>`
  ${props => !props.$vertical
    ? 'width: 220px;'
    : 'height: 200px;'}
`