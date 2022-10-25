import styled from 'styled-components/macro'

import { KpiShortText } from '../KpiWidget/styledComponents'

export const VenueName = styled.div`
    white-space: nowrap;
    width: 155px;
    overflow: hidden;
    text-overflow: ellipsis;
`

export const Wrapper = styled.div`
    .ant-table-tbody > tr > td {
        padding-top: 12px !important;
        padding-bottom: 12px !important;
    }
`

export const ThresholdText = styled(KpiShortText)`
    margin-bottom: -12px;
`