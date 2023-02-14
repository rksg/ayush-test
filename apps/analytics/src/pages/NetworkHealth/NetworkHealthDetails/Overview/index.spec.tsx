import { render, screen } from '@acx-ui/test-utils'

import { NetworkHealthTest } from '../../types'

import { Overview } from '.'

describe('Overview component', () => {
  it('should render correctly', async () => {
    render(<Overview details={{} as NetworkHealthTest}/>)
    expect(await screen.findByText('Overview')).toBeVisible()
  })
})
