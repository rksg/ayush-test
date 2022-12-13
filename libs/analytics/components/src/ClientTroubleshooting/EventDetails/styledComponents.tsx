import styled from 'styled-components'

export const Header = styled.h3`
  font-size: 10px;
  line-height: 16px;
  margin: 5px auto 5px;
  font-weight: 700;
  text-align: left;
  font-family: var(--acx-neutral-brand-font);
  color: var(--acx-primary-black);
`

export const CloseSpan = styled.span`
  cursor: pointer;
  position: absolute;
  right: 5px;
  top: 5px;
`

export const RowContainer = styled.dl`
  display: grid;
  grid-template-columns: 60px 1fr;
  grid-auto-flow: row;
  grid-gap: 0.8em 5px;
  font-size: 12px;
  line-height: 1.3;
  width: 100%;
  &:last-of-type {
    margin-bottom: 0;
  }

  font-family: var(--acx-neutral-brand-font);
`

export const RowLabel = styled.dt`
  margin: 0;
  font-weight: 400;
  font-size: 10px;
  font-family: var(--acx-neutral-brand-font);
  font-style: normal;
  color: var(--acx-neutrals-70);
`

export const RowValue = styled.dd`
  margin: 0;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  font-weight: 400;
  font-size: 10px;
  font-family: var(--acx-neutral-brand-font);
  color: var(--acx-primary-black);
`
