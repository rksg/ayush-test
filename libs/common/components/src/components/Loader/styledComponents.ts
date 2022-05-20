import styled, { css } from 'styled-components/macro'

export const Wrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
`

export const FallbackWrapper = styled.div<{ $isFetching?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;

  ${props => props.$isFetching ? css`
    position: absolute;
    z-index: 2;
    background-color: var(--acx-primary-white);
    opacity: 0.8;
    @supports (backdrop-filter: none) {
      & {
        backdrop-filter: blur(2px);
        background: none;
        opacity: 1;
      }
    }
  ` : ''}
`
