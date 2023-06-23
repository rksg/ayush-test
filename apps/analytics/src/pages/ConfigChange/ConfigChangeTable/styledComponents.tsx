import styled from 'styled-components/macro'

export const Dot = styled.div<{ color: string }>`
  height: 12px;
  width: 12px;
  background-color: ${props => props.color};
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
`

export const Block = styled.div`
  display: inline-block;
`
