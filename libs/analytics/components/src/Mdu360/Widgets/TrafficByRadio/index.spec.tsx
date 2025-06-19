import React from 'react'

import { formats }                                             from '@acx-ui/formatter'
import { Provider }                                            from '@acx-ui/store'
import { fireEvent, render, screen }                           from '@acx-ui/test-utils'
import { AnalyticsFilter, DateRange, NodesFilter, SSIDFilter } from '@acx-ui/utils'

jest.mock('./services', () => ({
  use
}))