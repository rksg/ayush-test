import styled from 'styled-components/macro'

export const RadioDescription = styled.div`
  color: var(--acx-neutrals-60);
  font-size: 12px;
  margin-top: 4px;
`

export const FwDescription = styled.div`
  color: var(--acx-primary-black);
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-subtitle-5-font-size);
  display: inline-block;
`

export const FwVersion = styled(FwDescription)`
  font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
`
