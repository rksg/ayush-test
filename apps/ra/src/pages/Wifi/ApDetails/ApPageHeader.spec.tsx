
import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import ApPageHeader from './ApPageHeader'

describe('ApPageHeader', () => {
  it('should render correct breadcrumb', async () => {
    render(<ApPageHeader />, { route: { params: {} }, wrapper: Provider })
    expect(await screen.findByText('Wi-Fi')).toBeVisible()
    expect(await screen.findByText('Access Points')).toBeVisible()
    expect(screen.getByRole('link', {
      name: /ap list/i
    })).toBeTruthy()
  })
})
