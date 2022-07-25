import styled, { css } from 'styled-components/macro'

export const Row = styled.div`
  cursor: pointer;
  ${props => props.onClick
    ? css`text-decoration-line: underline; text-decoration-style: dotted;`
    : ''}
`
