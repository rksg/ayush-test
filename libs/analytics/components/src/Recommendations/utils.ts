import { getIntl } from '@acx-ui/utils'

import { CrrmListItem } from '../Recommendations/services'

export const isOptimized = (recommendation: CrrmListItem) => {
  const optimizedStates = ['applied', 'applyscheduleinprogress', 'applyscheduled']
  return optimizedStates.includes(recommendation.status)
}

export const getCrrmLinkText = (recommendation: CrrmListItem) => {
  const { $t } = getIntl()
  const optimized = isOptimized(recommendation)
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

  return optimized ? optimizedText : nonOptimizedText
}
