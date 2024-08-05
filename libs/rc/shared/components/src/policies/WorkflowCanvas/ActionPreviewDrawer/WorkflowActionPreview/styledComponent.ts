import styled from 'styled-components'


export const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  max-width: 360px;
`

export const Logo = styled.div`
  margin: 24px;

  svg {
    width: 100%;
    height: 100%;
  }
`

export const Title = styled.div`
  font-weight: 600;
  padding-bottom: 4px;
`

export const Body = styled.div`
  padding: 20px 0;
`

export const PoweredByContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
`
