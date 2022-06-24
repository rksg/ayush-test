import styled from 'styled-components/macro'

export const ListWrapper = styled.ul`
  padding: 0px;
  margin: 0px;
  list-style-type: none;
`

export const ListItem = styled.li`
  font-weight: 400;
`

export const TimeWrapper = styled.div`
  font-weight: 700;
  padding-bottom: 5px;
`

export const Dot = styled.div<{ $color: string }>`
  margin-right: 4px;
  height: 6px;
  width: 6px;
  background-color: ${props => props.$color};
  border-radius: 50%;
  display: inline-block;
`

export const ValueWrapper = styled.span`
  font-weight: 600;
`
