import { noDataSymbol } from '@acx-ui/analytics/utils'
import '@testing-library/jest-dom'

import {
  getIncidentBySeverity,
  formatDate
} from './utils'

describe('IncidentTable: utils', () => {

  it('getIncidentBySeverity', () => {
    const testSeverityArr = [
      { value: 0, label: 'P4' }, 
      { value: 0.65, label: 'P3' }, 
      { value: 0.8, label: 'P2' },
      { value: 1, label: 'P1' }
    ]

    testSeverityArr.forEach((severity) => {
      const calculatedSeverity = getIncidentBySeverity(severity.value)
      expect(calculatedSeverity).toBe(severity.label)
    })

    const testUndefinedSeverity = getIncidentBySeverity(undefined)
    expect(testUndefinedSeverity).toBe(noDataSymbol)

    const testNullSeverity = getIncidentBySeverity(null)
    expect(testNullSeverity).toBe(noDataSymbol)
  })

  it('formatDate', () => {
    const testWorkingDate = formatDate('2022-08-15T00:00:00+08:00')
    expect(testWorkingDate).toBe('Aug 15 2022 00:00')

    const testUndefinedDate = formatDate()
    expect(testUndefinedDate).toBe(noDataSymbol)
  })

  
})

