import styled, { css } from 'styled-components/macro'

export const Wrapper = styled.section.attrs((props: { layers: Array<unknown> }) => props)`
  display: grid;
  grid-gap: 0px 16px;
  grid-template-columns:
    minmax(max-content, 200px)
    ${props => Array(props.layers.length - 1).fill('minmax(max-content, 60px)').join('\n')}
  ;
  font-family: var(--acx-neutral-brand-font);
  line-height: var(--acx-body-5-line-height);
  font-style: normal;
  font-weight: var(--acx-body-font-weight);
  font-size: var(--acx-body-5-font-size);
`

export const Container = styled.section.attrs((props: { layers: Array<unknown> }) => props)`
  grid-area: 1 / 1 / -1 / -1;
  display: grid;
  grid-gap: 0px 16px;
  grid-template-columns:
    minmax(min-content, 200px)
    ${props => Array(props.layers.length - 1).fill('minmax(max-content, 60px)').join('\n')}
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
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }
`

const stepFlowColorHelper = (state: string) => (state === 'failed')
  ? 'var(--acx-semantics-red-50)'
  : 'var(--acx-neutrals-60)'

const stepFlowMapper = (color: string) => ({
  left: css`
    border-right: 6px solid ${color};
  `,
  right: css`
    border-left: 6px solid ${color};
  `
})

export const StepFlow = styled.div.attrs((props: { direction: string, state: string }) => props)`
  align-self: center;
  display: flex;
  align-items: center;
  flex-direction: ${props => props.direction === 'left' ? 'row' : 'row-reverse'};

  &:after {
    content: '';
    display: block;
    height: 2px;
    background-color: ${props => stepFlowColorHelper(props.state)};
    flex: 1;
    ${props => (props.direction === 'left') ? 'margin-right: 2px' : 'margin-left: 2px'};
  }

  &:before {
    content: '';
    display: block;
    border: 0 solid transparent;
    border-width: 3px 0;
    ${props => {
    const color = stepFlowColorHelper(props.state)
    const stepFlowColor = stepFlowMapper(color)[props.direction as 'left' | 'right']
    return stepFlowColor}}

  }
`

export const StepLabel = styled.p`
  align-self: center;
  grid-column: 1 / 2;
  font-size: 11px;
  color: var(--acx-primary-black);
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0px;
  font-size: var(--acx-body-5-font-size);
`