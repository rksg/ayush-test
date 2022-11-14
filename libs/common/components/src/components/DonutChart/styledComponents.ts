import styled from 'styled-components'

interface SubTitleProps {
  width: number
}
export const SubTitle = styled.div<SubTitleProps>`
  width: ${props => `${props.width}px` };
  word-break: break-word;
  text-align: center;
  margin-block-start: 5px;
  padding: 0px ${props => `calc(${props.width}px * 0.18)` };
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-subtitle-6-font-size);
  line-height: var(--acx-subtitle-6-line-height);
  font-weight: var(--acx-subtitle-6-font-weight);
`
