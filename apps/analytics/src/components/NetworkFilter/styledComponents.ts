import styled from 'styled-components/macro'

export const NonSelectableItem = styled.div.attrs(
  { onClick: e => e.stopPropagation() }
)`
  width: 100%;
`
export const Container = styled.div`
  min-width: 150px;
  max-width: 180px;
`
