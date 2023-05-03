import styled from 'styled-components'

import { TrendPill } from '@acx-ui/components'

export const BigTrendPill = styled(TrendPill)`
    font-size: var(--acx-subtitle-7-font-size);
    padding: 7px 12px;
    font-weight: normal;
`
export const TrendCircle = styled(TrendPill)`
    padding: 4px 4px;
`

export const ChartsContainer = styled.div`
    padding-top: 20px;
`
export const ReportSectionTitle = styled.div`
    font-size: var(--acx-body-2-font-size);
    font-family: var(--acx-accent-brand-font);
    font-weight: var(--acx-body-font-weight-bold);
    line-height: var(--acx-body-3-line-height);
`
export const Label = styled.span`
    color: var(--acx-neutrals-60);
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
`
export const Value = styled.span`
    margin-top: 4px;
    color: var(--acx-primary-black);
    font-size: var(--acx-headline-4-font-size);
    line-height: var(--acx-headline-4-line-height);
    font-family: var(--acx-accent-brand-font);
    font-weight: var(--acx-headline-4-font-weight-bold);
`
