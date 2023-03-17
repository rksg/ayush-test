import styled from 'styled-components/macro'


export const Section = styled.div`
  margin-top: 12px;
`

export const TitleActive = styled.div`
  color: #7f7f7f;
`

export const ItemModel = styled.div`
  margin-left: 28px;
`

export const Ul = styled.ul`
  list-style-type: none;
  padding-left: 1em;
`

export const Li = styled.li`
  &:before {
    content: "-";
    position: absolute;
    margin-left: -1em;
  }
  margin-top: 5px;
`
