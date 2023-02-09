import { render, screen } from '@acx-ui/test-utils'

import { NetworkHealthTestResult } from '../../services'

import { Overview } from '.'

describe('Overview component', () => {
  it('should render correctly', async () => {
    render(<Overview details={{} as NetworkHealthTestResult}/>)
    expect(await screen.findByText('Overview')).toBeVisible()
  })
})
