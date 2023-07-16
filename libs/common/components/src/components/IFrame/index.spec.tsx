import { IFrame } from '@acx-ui/components'
import { render, screen } from '@acx-ui/test-utils'

describe('IFrame', () => {
  it('should render iframe', async () => {
    await render(<IFrame title='test iframe' src='/api/a4rc/explorer/'/>)
    expect(screen.getByTitle('test iframe')).toBeInTheDocument();
  })
})
