import { Badge }                                     from 'antd'
import _                                             from 'lodash'
import { MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { Tooltip, cssStr } from '@acx-ui/components'
import { noDataDisplay }   from '@acx-ui/utils'

import * as UI from './styledComponents'

import { ConfigStatusEnum, getExecutionSectionData } from '.'

export enum ScoreBadgeStatusEnum {
  NA = 'na',
  Success = 'success',
  Failure = 'failure',
  Error = 'error'
}

interface ScoreColumn {
  text: MessageDescriptor,
  status: ScoreBadgeStatusEnum
  tooltip?: MessageDescriptor
}

export const scoreColumns: Record<string, ScoreColumn> = {
  testedAps: {
    text: defineMessage({ defaultMessage: 'APs Under Test' }),
    status: ScoreBadgeStatusEnum.NA
  },
  successAps: {
    text: defineMessage({ defaultMessage: 'Pass' }),
    status: ScoreBadgeStatusEnum.Success,
    // eslint-disable-next-line max-len
    tooltip: defineMessage({ defaultMessage: 'An AP is indicated as a pass if all test stages are successful' })
  },
  failureAps: {
    text: defineMessage({ defaultMessage: 'Fail' }),
    status: ScoreBadgeStatusEnum.Failure,
    // eslint-disable-next-line max-len
    tooltip: defineMessage({ defaultMessage: 'An AP is indicated as a fail if there is more than one unsuccessful test stage' })
  },
  errorAps: {
    text: defineMessage({ defaultMessage: 'Error' }),
    status: ScoreBadgeStatusEnum.Error,
    // eslint-disable-next-line max-len
    tooltip: defineMessage({ defaultMessage: 'An AP is indicated as an error if the test for any stage below is not executed due to system, configuration or connection issues' })
  }
}

export const Score = ({ details }: { details: ReturnType<typeof getExecutionSectionData> }) => {
  const { $t } = useIntl()
  const colors = {
    [ScoreBadgeStatusEnum.NA]: 'transparent',
    [ScoreBadgeStatusEnum.Success]: cssStr('--acx-semantics-green-50'),
    [ScoreBadgeStatusEnum.Failure]: cssStr('--acx-semantics-red-50'),
    [ScoreBadgeStatusEnum.Error]: cssStr('--acx-semantics-yellow-40')
  }
  return <UI.ScoreWrapper>
    <UI.ScoreTitle>{$t({ defaultMessage: 'Total Score:' })}</UI.ScoreTitle>
    {Object.keys(scoreColumns).map(key => {
      const item = scoreColumns[key]
      const configured = _.get(details, ['configured', key])
      const value = _.get(details, key)
      const ScoreText = <span key={`score-text-${key}`}>
        <UI.ScoreValue>
          { configured === ConfigStatusEnum.NoData ? noDataDisplay : value || 0}
        </UI.ScoreValue>
        <UI.ScoreText>{$t(item.text)}</UI.ScoreText>
      </span>
      return item.status === ScoreBadgeStatusEnum.NA
        ? ScoreText
        : <Tooltip key={key} title={$t(item.tooltip!)}>
          <Badge color={colors[item.status]} text={ScoreText} />
        </Tooltip>
    })}
  </UI.ScoreWrapper>
}
