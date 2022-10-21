import styled from 'styled-components/macro'


export const CountryDescLabel = styled.span`
font-size: var(--acx-body-5-font-size);
line-height: 32px;

`

export const FieldLabel = styled.div<{ width: string }>`
font-size: var(--acx-body-4-font-size);
display: grid;
line-height: 32px;
grid-template-columns: ${props => props.width} 1fr;
`

export const CurrentCountryLabel = styled.span`
font-size: var(--acx-body-4-font-size);
line-height: var(--acx-body-4-line-height);
`