import { IntlShape } from 'react-intl'

import { EnhancedRecommendation } from '../Recommendations/RecommendationDetails/services'

export const getOptimized = (recommendation: EnhancedRecommendation[]) => {
  const optimizedStates = ['applied', 'applyscheduleinprogress', 'applyscheduled']
  const optimizedData = recommendation?.filter(detail => optimizedStates.includes(detail.status))
  return {
    total: optimizedData?.length,
    isOptimized: optimizedData?.length > 0
  }
}

export const getCrrmLinkText = (
  recommendation: EnhancedRecommendation,
  $t: IntlShape['$t'],
  optimized: boolean
) => {
  const { appliedOnce, status, kpi_number_of_interfering_links } = recommendation
  const applied = appliedOnce && status !== 'reverted'
  const before = (applied
    ? kpi_number_of_interfering_links?.previous
    : kpi_number_of_interfering_links?.current) || 0
  const after = (applied
    ? kpi_number_of_interfering_links?.current
    : kpi_number_of_interfering_links?.projected) || 0

  const optimizedText = $t({
    defaultMessage:
      'From {before} to {after} interfering {after, plural, one {link} other {links}}',
    description: 'Translation string - From, to, interfering, link, links'
  }, { before, after })

  const nonOptimizedText = $t({
    defaultMessage:
    // eslint-disable-next-line max-len
      '{before} interfering {before, plural, one {link} other {links}} can be optimized to {after}',
    description: 'Translation string - interfering, link, links, can be optimized to'
  }, { before, after })

  return optimized ? optimizedText : nonOptimizedText
}