import { render, screen } from '@acx-ui/test-utils'

import { ApSnmpMibsDownloadInfo } from './index'

const mockedNewTabLink = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  NewTabLink: () => mockedNewTabLink
}))

describe('ApSnmpMibsDownloadInfo', () => {
  it('renders without crashing', async () => {
    render(<ApSnmpMibsDownloadInfo/>)

    expect(await screen.findByRole('link', {
      name: /download ruckus one mibs file/i
    })).toBeInTheDocument()
  })
})
