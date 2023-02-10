import { Badge as antBadge } from 'antd'
import styled                from 'styled-components/macro'

export enum ScoreBadgeStatusEnum {
  NA = 'na',
  Success = 'success',
  Failure = 'failure',
  Error = 'error'
}

export const Badge = styled(antBadge)<{ $type: ScoreBadgeStatusEnum }>`
  .ant-badge-status-dot{
    top: 0;
    margin-right: 3px;
    ${props => props.$type === ScoreBadgeStatusEnum.NA ? 'display: none;' : ''}
  }
  .ant-badge-status-text {
    margin: 0;
  }
`
export const ScoreWrapper = styled.div`
  margin-left: 10px;
  display: grid;
  grid-gap: 0 20px;
  grid-template-columns: repeat(5, auto);
`

export const ScoreTitle = styled.span`
  font-weight: var(--acx-body-font-weight-bold);
`

export const ScoreValue = styled.span`
  font-weight: var(--acx-body-font-weight-bold);
  margin: 0 3px;
`

export const ScoreText = styled.span`
  color: var(--acx-neutrals-60)
`