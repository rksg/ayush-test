import styled from 'styled-components'

export const Header = styled.h3`
  font-size: 10px;
  line-height: 16px;
  font-weight: 700;
  text-align: left;
  font-family: var(--acx-neutral-brand-font);
  color: var(--acx-primary-black);
`

export const CloseRowWrapper = styled.div`
  text-align: end;
`
export const CloseIconContainer = styled.span`
  cursor: pointer;
  position: absolute;
`

export const VerticalLine = styled.div`
  height: 100%;
  width: 100%;
  border-right: 1px solid var(--acx-neutrals-30);
`
export const DetailsWrapper = styled.div`
  width: 250px;
  height: 100%;
`

export const DetailsRowLabel = styled.div`
  font-weight: var(--acx-subtitle-6-font-weight);
  font-size: var(--acx-subtitle-6-line-height);
  font-family: var(--acx-neutral-brand-font);
  font-style: normal;
  color: var(--acx-neutrals-70);
`

export const DetailsRowValue = styled.div`
  font-weight: var(--acx-subtitle-6-font-weight);
  font-size: var(--acx-subtitle-6-font-size);
  font-family: var(--acx-neutral-brand-font);
  color: var(--acx-primary-black);
`