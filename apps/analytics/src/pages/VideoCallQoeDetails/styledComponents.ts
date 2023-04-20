import styled from 'styled-components'

import { TrendPill } from '@acx-ui/components'

export const BigTrendPill = styled(TrendPill)`
    font-size: var(--acx-subtitle-7-font-size);
    padding: 7px 10px;
    font-weight: normal;
`
export const CharsContainer = styled.div`
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
    color: var(--acx-primary-black);
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
`