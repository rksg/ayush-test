import styled from 'styled-components'

export const Badge = styled.div<{ color: string }>`
  background: var(${props => props.color});
  border-radius: 2px;
  padding: 0px 4px;
  color: var(--acx-primary-white);
  font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
  line-height: var(--acx-subtitle-5-line-height);
  font-size: var(--acx-body-5-font-size);
  display: inline-block;
`