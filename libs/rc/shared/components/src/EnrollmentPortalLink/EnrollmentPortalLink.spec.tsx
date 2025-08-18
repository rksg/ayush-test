import React from 'react'

import userEvent from '@testing-library/user-event'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { EnrollmentPortalLink } from '.'


describe('Enrollment Portal Link', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should render correctly when workFlowQrCodeGenerate is false', async () => {
    (useIsSplitOn as jest.Mock).mockReturnValue(false)

    const copyFn = jest.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText: copyFn
      }
    })

    render(
      <Provider>
        <EnrollmentPortalLink url='test-url' name='test-name' />
      </Provider>
    )

    expect(await screen.findByRole('link', { name: 'test-url' })).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button'))
    expect(await screen.findByRole('tooltip', { name: /URL Copied/ })).toBeInTheDocument()
    expect(copyFn).toHaveBeenCalledWith('test-url')
  })

  it('should render correctly when workFlowQrCodeGenerate is true', async () => {
    (useIsSplitOn as jest.Mock).mockReturnValue(true)

    const copyFn = jest.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText: copyFn
      }
    })

    render(
      <Provider>
        <EnrollmentPortalLink url='test-url' name='test-name' />
      </Provider>
    )

    const buttons = await screen.findAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3) // Copy, Open, QR
    await userEvent.click(buttons[0]) // Copy button
    expect(await screen.findByRole('tooltip', { name: /URL Copied/ })).toBeInTheDocument()
    expect(copyFn).toHaveBeenCalledWith('test-url')
  })

  it('should render QR code in Modal and download QR code successfully', async () => {
    // Mock feature toggle to enable QR code
    (useIsSplitOn as jest.Mock).mockReturnValue(true)
    // Render component
    render(
      <Provider>
        <EnrollmentPortalLink url='test-url' name='test-name' />
      </Provider>
    )
    // Find and click the QR code button (third button)
    const buttons = await screen.findAllByRole('button')
    await userEvent.click(buttons[2])
    // Verify modal is shown
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    // Mock SVG and ref
    const mockSVG = { outerHTML: '<svg></svg>' }
    const mockQRRef = { querySelector: jest.fn().mockReturnValue(mockSVG) }
    jest.spyOn(React, 'useRef').mockReturnValue({ current: mockQRRef })
    // Save original URL methods and mock them
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL
    URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url')
    URL.revokeObjectURL = jest.fn()
    // Mock XMLSerializer
    const originalXMLSerializer = window.XMLSerializer
    window.XMLSerializer = jest.fn().mockImplementation(() => ({
      serializeToString: jest.fn().mockReturnValue('<svg></svg>')
    }))
    // Mock Image with proper typing
    const mockImage: Partial<HTMLImageElement> = { onload: null, src: '' }
    const originalImage = window.Image
    window.Image = jest.fn().mockImplementation(() => mockImage as HTMLImageElement)
    // Mock canvas and context
    const mockContext = {
      fillRect: jest.fn(),
      fillText: jest.fn(),
      drawImage: jest.fn()
    }
    const mockCanvas = {
      getContext: jest.fn().mockReturnValue(mockContext),
      width: 0,
      height: 0,
      toBlob: jest.fn().mockImplementation(cb => cb(new Blob()))
    }
    // Mock link
    const mockLink = { click: jest.fn(), href: '', download: '' }
    // Mock document.createElement
    const originalCreateElement = document.createElement
    document.createElement = jest.fn().mockImplementation(tag => {
      if (tag === 'canvas') return mockCanvas as unknown as HTMLCanvasElement
      if (tag === 'a') return mockLink as unknown as HTMLAnchorElement
      return originalCreateElement.call(document, tag)
    })
    // Mock DOM manipulation methods
    const originalAppendChild = document.body.appendChild
    const originalRemoveChild = document.body.removeChild
    document.body.appendChild = jest.fn()
    document.body.removeChild = jest.fn()
    // Find and click the download button
    const downloadButton = await screen.findByRole('button', { name: 'Download' })
    await userEvent.click(downloadButton)
    // Properly cast onload to a function
    if (mockImage.onload) {
      (mockImage.onload as Function)()
    }
    // Verify download worked
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(mockLink.click).toHaveBeenCalled()
    expect(mockLink.download).toBe('test-name.png')
    // Restore all mocks
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    window.XMLSerializer = originalXMLSerializer
    window.Image = originalImage
    document.createElement = originalCreateElement
    document.body.appendChild = originalAppendChild
    document.body.removeChild = originalRemoveChild
    jest.restoreAllMocks()
  })
})
