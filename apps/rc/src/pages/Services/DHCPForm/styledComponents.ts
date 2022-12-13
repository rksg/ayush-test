import styled from 'styled-components/macro'

export const Diagram = styled.div`
  width: 358px;
  margin-top: 40px;
`

export const RadioDescription = styled.div`
  color: var(--acx-neutrals-50);
  margin-top: 4px;
`
export const RequiredStart = styled.label`
  .require {
    &::after {
      margin-right: 0;
      margin-left: 3px;
      color: var(--acx-accents-orange-50);
      font-family: var(--acx-neutral-brand-font);
      font-size: var(--acx-body-4-font-size);
      line-height: var(--acx-body-4-line-height);
      content: "*";
    }
`
