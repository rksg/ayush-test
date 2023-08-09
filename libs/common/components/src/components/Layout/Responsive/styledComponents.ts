import styled from 'styled-components/macro'

export const SpaceAlignContainer = styled.div`
  @media screen and (max-width: 799px) {
    width: 608px;
    height: 450px;

  }

  @media screen and (max-width: 519px) {
    width: 440px;
  }

  width: 810px;
  padding: 25px;
  display: flex;
  margin: 10% auto;
  flex-wrap: wrap;
  text-align: center;
  align-items: center;
  justify-content: center;
  -webkit-align-items: center;
  background-color: var(--acx-primary-white);
  box-shadow: 0px 4px 8px rgba(51, 51, 51, 0.15);
`

export const SpaceAlignBlock = styled.div`
  @media screen and (max-width: 799px) {
    width: 240px;
    height: 88px;
    padding: 20px 10px 10px 10px;
    margin: 5px;
  }

  @media screen and (max-width: 519px) {
    width: 180px;
  }

  padding: 50px 10px 10px 10px;
  width: 180px;
  height: 142px;
  flex-wrap: wrap;
  margin: 0px 5px;
  border-radius: 4px;
  background-color: var(--acx-neutrals-10);
}`

export const Description = styled.div`
  width: 100%;
`
