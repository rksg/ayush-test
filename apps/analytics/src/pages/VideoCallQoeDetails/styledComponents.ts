import { Typography } from 'antd'
import styled         from 'styled-components'

import { TrendPill } from '@acx-ui/components'

export const BigTrendPill = styled(TrendPill)`
    font-size: var(--acx-subtitle-7-font-size);
    padding: 7px 10px;
    font-weight: normal;
`

export const Title = styled(Typography.Title).attrs({ level: 4 })`
    font-size: var(--acx-subtitle-7-font-size);
    padding: 7px 8px 0px 15px;
    font-weight: normal;
`
