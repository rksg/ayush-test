import styled from 'styled-components/macro'

export const Wrapper = styled.section`
  display: grid;
  min-height: 100%;
  grid-gap: 5px 16px;
  padding-left: 8px;
  padding-right: ${8 + 16}px;
  grid-template-columns:
    minmax(140px, 260px)
  ;
` // above needs length, for grid-template-columns

export const Container = styled.section`
  grid-area: 1 / 1 / -1 / -1;
  display: grid;
  min-height: 100%;
  grid-gap: 5px 16px;
  grid-auto-rows: min-content;
  grid-template-columns:
    minmax(140px, 260px)
  ;
`// above needs length, for grid-template-columns

export const Layer = styled.div`
  grid-row: 1 / -1;
  width: 16px;
  background-color: var(--acx-primary-white);
  justify-self: end;
  margin: 0 -16px;
  margin-left: 0;
  writing-mode: vertical-lr;
  display: flex;
  align-items: center;
  span {
    color: var(--acx-primary-black);
    font-size: 10px;
    position: sticky;
    top: 11px;
    opacity: 0.9;
  }
`

export const StepFlow = styled.div`
  height: 25px;
  align-self: center;
  display: flex;
  align-items: center;
  flex-direction: row;
  &:before, &:after {
    content: '';
    display: block;
  }
  &:after {
    height: 6px;
    background-color: var(--acx-primary-white);
    flex: 1;
  }
  &:before {
    border: 0 solid transparent;
    border-width: 7px 0;
    
  }
` // before missing directions, flex-directions to flip based on left / right direction

export const StepLabel = styled.p`
  align-self: center;
  padding: 0 8px;
  margin: 0;
  margin-left: -8px;
  grid-column: 1 / 2;
  font-size: 11px;
  color: var(--acx-primary-black);
  overflow: hidden;
  text-overflow: ellipsis;
` // font-weight bold for faild arrows