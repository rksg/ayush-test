import { act, render, screen } from '@acx-ui/test-utils'

import DownloadLink from './downloadLink'
const currentDate = new Date()
const linkValues: { [k: string]: string; } = {
  downloadLinkCreatedTime: '' + currentDate.getTime(),
  downloadLinkExpiry: '1440',
  downloadLink: 'download-link',
  linkAlias: 'Download'
}

describe('DownloadLink', () => {

  it('Should render link', async () => {
    jest.useFakeTimers()
    render(<DownloadLink
      values={linkValues}
    />)

    const downloadLink = screen.getByRole('link', { name: 'Download' })

    expect(downloadLink).toBeInTheDocument()

    act(() => {
      jest.runOnlyPendingTimers()
    })

    expect(await screen.findByText('Download')).toBeInTheDocument()

    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })
})
