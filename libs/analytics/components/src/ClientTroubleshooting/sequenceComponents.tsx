import styled from 'styled-components/macro'

export const Wrapper = styled.section.attrs((props: { layers: Array<unknown> }) => props)`
  display: grid;
  min-height: 100%;
  grid-gap: 5px 16px;
  padding-left: 8px;
  padding-right: ${8 + 16}px;
  grid-template-columns:
    minmax(140px, 260px)
    ${props => Array(props.layers.length - 1).fill('minmax(20px, 60px)').join('\n')}
  ;
`

export const Container = styled.section.attrs((props: { layers: Array<unknown> }) => props)`
  grid-area: 1 / 1 / -1 / -1;
  display: grid;
  min-height: 100%;
  grid-gap: 5px 16px;
  grid-auto-rows: min-content;
  grid-template-columns:
    minmax(140px, 260px)
    ${props => Array(props.layers.length - 1).fill('minmax(20px, 60px)').join('\n')}
  ;
`

export const Layer = styled.div`
  grid-row: 1 / -1;
  width: 16px;
  background-color: var(--acx-neutrals-70);
  justify-self: end;
  margin: 0 -16px;
  margin-left: 0;
  writing-mode: vertical-lr;
  display: flex;
  align-items: center;
  span {
    color: var(--acx-primary-white);
    font-size: 10px;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }
`

const stepFlowColorHelper = (state: string) => (state === 'normal')
  ? 'var(--acx-neutrals-60)'
  : 'var(--acx-semantics-red-50)'

const stepFlowMapper = (color: string) => ({
  left: `
    border-right: 9px solid ${color};
  `,
  right: `
    border-left: 9px solids ${color};
  `
})

export const StepFlow = styled.div.attrs((props: { direction: string, state: string }) => props)`
  height: 25px;
  align-self: center;
  display: flex;
  align-items: center;
  flex-direction: ${props => props.direction === 'left'
    ? 'row'
    : 'row-reverse'};
  &:before, &:after {
    content: '';
    display: block;
  }
  &:after {
    height: 6px;
    background-color: ${props => stepFlowColorHelper(props.state)};
    flex: 1;
  }
  &:before {
    border: 0 solid transparent;
    border-width: 7px 0;
    ${props => {
    const color = stepFlowColorHelper(props.state)
    const stepFlowColor = stepFlowMapper(color)[props.direction as 'left' | 'right']
    return stepFlowColor
  }}
  }
` // before missing directions, flex-directions to flip based on left / right direction

export const StepLabel = styled.p.attrs((prop: { state: string }) => prop)`
  align-self: center;
  padding: 0 8px;
  margin: 0;
  margin-left: -8px;
  grid-column: 1 / 2;
  font-size: 11px;
  color: var(--acx-primary-black);
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: ${props => props.state === 'failed' ? 'bold' : 'normal'};
`