import styled, { css } from 'styled-components/macro'

export const Wrapper = styled.div<{ $isLoading?: boolean }>`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;

  ${props => props.$isLoading ? css`
    background-color: var(--acx-neutrals-10);
  ` : ''}
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
    z-index: 5;
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
