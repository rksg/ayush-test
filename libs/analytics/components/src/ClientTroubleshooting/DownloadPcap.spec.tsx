import { dataApiURL, Provider }                                 from '@acx-ui/store'
import { render, screen, fireEvent, mockGraphqlQuery, waitFor } from '@acx-ui/test-utils'
import { handleBlobDownloadFile }                               from '@acx-ui/utils'

import { DownloadPcap } from './DownloadPcap'
import { b64ToBlob }    from './services'

const filename = 'test.pcap'
const originalContents = 'testing1234123'
const base64Contents = window.btoa(originalContents)
const mockUnwrap = jest.fn().mockImplementation(async () => ({
  pcapFile: b64ToBlob(base64Contents)
}))
const mockTrigger = jest.fn().mockImplementation(() => ({
  unwrap: mockUnwrap
}))
const mockData = {
  originalArgs: { filename }
}
jest.mock('./services', () => ({
  ...jest.requireActual('./services'),
  useClientPcapMutation: () => [
    mockTrigger,
    mockData
  ]
}))

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  handleBlobDownloadFile: jest.fn()
}))
const mockedDownload = jest.mocked(handleBlobDownloadFile)

describe('DownloadPcap', () => {
  beforeEach(() => {
    mockTrigger.mockClear()
    mockUnwrap.mockClear()
    mockedDownload.mockClear()
  })

  it('should correctly', async () => {
    render(<DownloadPcap pcapFilename={filename} />, { wrapper: Provider })
    expect(mockTrigger).toBeCalledTimes(0)
    expect(screen.getByRole('button', { name: 'Download .pcap' })).toBeVisible()
  })

  it('should handle success pcap download', async () => {
    const expectedResult = {
      client: {
        pcapFile: base64Contents
      }
    }
    mockGraphqlQuery(dataApiURL, 'ClientPcapFile', {
      data: expectedResult
    })
    render(<DownloadPcap pcapFilename={filename}/>, { wrapper: Provider })
    fireEvent.click(screen.getByRole('button', { name: 'Download .pcap' }))
    expect(mockTrigger).toBeCalledTimes(1)
    expect(screen.queryByRole('button', { name: 'Download .pcap' })).toBeNull()
    await waitFor(() => {
      expect(mockUnwrap).toHaveBeenCalledTimes(1)
    })
    await waitFor(() => {
      expect(mockedDownload).toHaveBeenCalledWith(b64ToBlob(base64Contents), filename)
    })
  })

  it('should handle failure pcap download', async () => {
    const expectedResult = {
      client: {
        pcapFile: base64Contents
      }
    }
    mockGraphqlQuery(dataApiURL, 'ClientPcapFile', {
      data: expectedResult
    })
    render(<DownloadPcap pcapFilename={filename}/>, { wrapper: Provider })
    mockUnwrap.mockImplementationOnce(async () => {
      throw new Error('failed to find pcap file')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Download .pcap' }))
    await waitFor(() => {
      expect(mockTrigger).toBeCalledTimes(1)
    })

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Download .pcap' })).toBeNull()
    })

    await waitFor(() => {
      expect(mockUnwrap).toHaveBeenCalledTimes(1)
    })
    await waitFor(() => {
      expect(mockedDownload).toHaveBeenCalledTimes(0)
    })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'failed to find pcap file' })).toBeVisible()
    })
  })
})