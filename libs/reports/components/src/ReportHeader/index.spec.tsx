import '@testing-library/jest-dom'
import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { ReportType } from '../mapping/reportsMapping'

import { ReportHeader } from '.'

describe('report header component', () => {
  const path = '/:tenantId/t'
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742'
  }
  it('should render correctly', () => {
    const { asFragment } = render(<Provider>
      <ReportHeader type={ReportType.CLIENT}/>
    </Provider>, { route: { path, params } })

    expect(asFragment()).toMatchSnapshot()
    expect(screen.getByPlaceholderText(/start date/i)).toBeDefined()
    expect(screen.getByPlaceholderText(/end date/i)).toBeDefined()
  })
})
