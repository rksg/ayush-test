import styled from 'styled-components'

export const TitleBadge = styled.span`
  color: var(--acx-primary-white);
  background-color: var(--acx-accents-orange-50);
  border-radius: 15px;
  padding-inline: 6px;
  font-size: var(--acx-subtitle-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
`

export const Count = styled.span`
  font-size: var(--acx-headline-2-font-size);
  line-height: var(--acx-headline-2-line-height);
  font-weight: var(--acx-headline-2-font-weight-bold);
  font-family: var(--acx-accent-brand-font);
  display: block;
  margin: -2px 0;
`

export const ImpactedClients = styled.span`
  font-size: var(--acx-body-6-font-size);
  line-height: 1.36;
  color: var(--acx-neutrals-50);
  display: block;
  margin-top: -1px;
`

export const Container = styled.div`
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
  font-family: var(--acx-neutral-brand-font);
  padding-left: 10px;
  border-left-width: 4px;
  border-left-style: solid;
`

export const Wrapper = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(2, 1fr);
  align-items: stretch;
`
