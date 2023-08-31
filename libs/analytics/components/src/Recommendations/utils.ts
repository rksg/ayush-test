import { getIntl } from '@acx-ui/utils'

import { StateType, rrmStates } from './config'
import { CrrmListItem }         from './services'

export const getOptimizedState = (state: StateType) => {
  const optimizedStates = ['applied', 'applyscheduleinprogress', 'applyscheduled']
  return optimizedStates.includes(state)
    ? rrmStates.optimized
    : rrmStates.nonOptimized
}

export const getCrrmLinkText = (recommendation: CrrmListItem) => {
  const { $t } = getIntl()
  const { appliedOnce, status, kpi_number_of_interfering_links } = recommendation
  const applied = appliedOnce && status !== 'reverted'
  const before = applied
    ? kpi_number_of_interfering_links?.previous
    : kpi_number_of_interfering_links?.current
  const after = applied
    ? kpi_number_of_interfering_links?.current
    : kpi_number_of_interfering_links?.projected

  const optimizedText = $t({
    // eslint-disable-next-line max-len
    defaultMessage: 'From {before} to {after} interfering {after, plural, one {link} other {links}}',
    description: 'Translation string - From, to, interfering, link, links'
  }, { before, after })

  const nonOptimizedText = $t({
    // eslint-disable-next-line max-len
    defaultMessage: '{before} interfering {before, plural, one {link} other {links}} can be optimized to {after}',
    description: 'Translation string - interfering, link, links, can be optimized to'
  }, { before, after })

  const optimizedState = getOptimizedState(status)
  return optimizedState === rrmStates.optimized ? optimizedText : nonOptimizedText
}
