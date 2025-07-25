import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { certificateAuthority } from '../__tests__/fixtures'

import ViewUploadSection from './ViewUploadSection'


jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  downloadFile: jest.fn()
}))

describe('ViewUploadDrawer', () => {
  it('should render CA correctly', async () => {
    render(
      <Provider>
        <ViewUploadSection
          setRawInfoDrawer={() => { }}
          setUploadDrawerOpen={() => { }}
          data={{ ...certificateAuthority }}
        />
      </Provider>
    )

    const viewButtons = screen.queryAllByRole('button', { name: 'View' })
    expect(viewButtons.length).toBe(3)
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('should render CA correctly without private key', async () => {
    render(
      <Provider>
        <ViewUploadSection
          setRawInfoDrawer={() => { }}
          setUploadDrawerOpen={() => { }}
          data={{ ...certificateAuthority, privateKeyBase64: '' }}
        />
      </Provider>
    )

    expect(screen.queryByText('Delete')).toBeNull()
    const privateKeyBtn = screen.queryByRole('button', { name: 'Upload' })
    expect(privateKeyBtn).toBeInTheDocument()
  })
})
