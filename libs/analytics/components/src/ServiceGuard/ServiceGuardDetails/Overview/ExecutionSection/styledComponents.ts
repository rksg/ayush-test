import styled from 'styled-components/macro'

import { TrendPill as BasePill } from '@acx-ui/components'

export const ScoreWrapper = styled.div`
  margin-left: 10px;
  display: grid;
  grid-gap: 0 20px;
  grid-template-columns: repeat(5, auto);

  .ant-badge-status-dot{
    top: 0;
    margin-right: 3px;
  }
  .ant-badge-status-text {
    margin: 0;
  }
`

export const ScoreTitle = styled.span`
  font-weight: var(--acx-body-font-weight-bold);
`

export const ScoreValue = styled.span`
  font-weight: var(--acx-body-font-weight-bold);
  margin: 0 3px;
`

export const ScoreText = styled.span`
  color: var(--acx-neutrals-60);
`

export const Pill = styled(BasePill)`
  vertical-align: middle;
  margin-top: -4px;
`
