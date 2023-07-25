import { render, screen } from '@acx-ui/test-utils'

import { IFrame } from '.'

describe('IFrame', () => {
  it('should render iframe', async () => {
    const location = {
      ...window.location,
      reload: jest.fn()
    }
    Object.defineProperty(window, 'location', {
      writable: true,
      value: location
    })
    await render(<IFrame title='test iframe' src='http://localhost/api/a4rc/explorer/'/>)
    const iframe = screen.getByTitle('test iframe') as HTMLIFrameElement
    expect(iframe).toBeInTheDocument()

    await iframe.setAttribute('src', 'https://example.com')

    await iframe.setAttribute('src', 'http://localhost/api/a4rc/explorer/')

    expect(window.location.reload).toHaveBeenCalled()
  })
})
