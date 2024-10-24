import styled from 'styled-components'


export const PreviewContainer = styled.div<({ hasBackgroundImage: boolean })>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  padding: 8px;

  width: 430px;
  max-width: 600px;
  min-height: 100%;

  background-color: ${props => props.hasBackgroundImage
    ? undefined
    : 'var(--acx-primary-white)'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--acx-primary-white);
    opacity: 0.75;
    z-index: 1;
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 2;
  }
`

export const Title = styled.div`
  font-weight: 600;
  padding: inherit;
  width: 100%;

  ${({ style })=> `color: ${style?.color}`};

  .ant-typography {
    ${({ style })=> `color: ${style?.color}`};
  }
`

export const Body = styled.div`
  padding: 24px 10px;
  width: 100%;

  ${({ style })=> `color: ${style?.color}`};

  .ant-typography {
    ${({ style })=> `color: ${style?.color}`};
  }
`

export const PoweredByContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
`
