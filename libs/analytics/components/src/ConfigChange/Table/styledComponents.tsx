import styled from 'styled-components/macro'

export const Dot = styled.div<{ color: string }>`
  display: grid;
  grid-template-columns: 12px 1fr;
  grid-column-gap: 6px;
  &:before {
    content: '';
    height: 12px;
    width: 12px;
    background-color: ${props => props.color};
    border-radius: 50%;
    display:inline-block;
    margin-top: 2px;
  }
`