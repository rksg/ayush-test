import styled from 'styled-components/macro'

export const ApGroupDetailSubTitle = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: 5px;
  align-items: center;
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  font-weight: var(--acx-body-font-weight);
  color: var(--acx-neutrals-60);
  margin-top: 10px;
  svg {
    width: var(--acx-body-3-font-size);
    height: var(--acx-body-3-font-size);
    path {
      stroke: var(--acx-primary-black);
    }
  }
`