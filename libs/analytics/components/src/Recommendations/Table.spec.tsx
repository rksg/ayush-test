import { BrowserRouter } from 'react-router-dom'

import { render, screen } from '@acx-ui/test-utils'
import { NetworkPath }    from '@acx-ui/utils'

import { crrmStates, StateType }      from './config'
import { RecommendationListItem }     from './services'
import { crrmStateSort, UnknownLink } from './Table'

const unknownRecommendation = {
  id: '4',
  code: 'unknown',
  status: 'Insufficient Licenses',
  createdAt: '2023-11-09T07:05:14.900Z',
  updatedAt: '2023-11-12T06:05:21.004Z',
  sliceType: 'zone',
  sliceValue: '01-US-CA-D1-Ruckus-HQ-QA-interop',
  metadata: {
    audit: [{
      code: 'global',
      stage: 'filter',
      failure: {
        'not-fully-licensed': false
      }
    }]
  },
  isMuted: false,
  mutedBy: '',
  mutedAt: null,
  path: [
    {
      type: 'system',
      name: 'vsz34'
    },
    {
      type: 'domain',
      name: '01-US-CA-D1-Test-Home'
    },
    {
      type: 'zone',
      name: '01-US-CA-D1-Ruckus-HQ-QA-interop'
    }
  ] as NetworkPath,
  // eslint-disable-next-line max-len
  scope: 'vsz34 (SZ Cluster)\n> 01-US-CA-D1-Test-Home (Domain)\n> 01-US-CA-D1-Ruckus-HQ-QA-interop (Zone)',
  type: 'string',
  priority: {
    label: {
      defaultMessage: [{
        type: 0,
        value: 'low'
      }],
      id: '477I0g'
    },
    order: 0
  },
  category: 'Insufficient Licenses',
  summary: 'Insufficient Licenses',
  statusTooltip: 'Insufficient Licenses',
  statusEnum: 'insufficientLicenses' as StateType
}

describe('crrmStateSort', () => {
  it('sorts by optimized state', () => {
    const itemA = { crrmOptimizedState: crrmStates.optimized } as RecommendationListItem
    const itemB = { crrmOptimizedState: crrmStates.nonOptimized } as RecommendationListItem
    expect(crrmStateSort(itemA, itemB)).toBe(-1)
    expect(crrmStateSort(itemB, itemA)).toBe(1)
    expect(crrmStateSort(itemB, itemB)).toBe(0)
  })
})

describe('UnknownLink', () => {
  it('should work', async () => {
    render(<BrowserRouter>
      <UnknownLink value={unknownRecommendation} />
    </BrowserRouter>)
    const button = screen.getByRole('button')
    expect(button).toBeVisible()
  })
})
