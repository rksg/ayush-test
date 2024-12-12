import { ConfigTemplateDriftRecord } from '@acx-ui/rc/utils'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { DriftComparison, DriftViewer } from './DriftComparison'

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Tooltip: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <div data-testid='tooltip-title'>{title}</div>
      {children}
    </div>
  )
}))

describe('DriftComparison', () => {
  it('renders the component with the correct data and background colors', () => {
    const mockData: ConfigTemplateDriftRecord = {
      path: 'WifiNetwork',
      data: {
        template: 'template value',
        instance: 'instance value'
      }
    }
    render(<DriftComparison {...mockData} />)

    expect(screen.getByText('WifiNetwork')).toBeInTheDocument()

    const templateCol = screen.getByText('template value')
    expect(templateCol).toBeInTheDocument()
    expect(templateCol).toHaveStyle('background-color: #FBD9AB')

    const instanceCol = screen.getByText('instance value')
    expect(instanceCol).toBeInTheDocument()
    expect(instanceCol).toHaveStyle('background-color: #FBD9AB')
  })

  it('displays correct background colors when template is empty', () => {
    const mockEmptyTemplateData: ConfigTemplateDriftRecord = {
      path: 'Empty Template',
      data: {
        template: '',
        instance: 'instance value'
      }
    }
    render(<DriftComparison {...mockEmptyTemplateData} />)
    const instanceCol = screen.getByText('instance value')
    expect(instanceCol).toHaveStyle('background-color: #B4E8C7')

    const templateCol = instanceCol.previousSibling!
    expect(templateCol).toHaveStyle('background-color: #F2F2F2')
  })

  it('displays correct background colors when instance is empty', () => {
    const mockEmptyInstanceData: ConfigTemplateDriftRecord = {
      path: 'Empty Instance',
      data: {
        template: 'template value',
        instance: ''
      }
    }
    render(<DriftComparison {...mockEmptyInstanceData} />)
    const templateCol = screen.getByText('template value')
    expect(templateCol).toHaveStyle('background-color: #B4E8C7')

    const instanceCol = templateCol.nextSibling!
    expect(instanceCol).toHaveStyle('background-color: #F2F2F2')
  })

  describe('DriftViewer', () => {
    it('renders an image link when value is an image URL', async () => {
      const imageUrl = 'https://example.com/image.png'

      render(<DriftViewer value={imageUrl} />)

      const linkElement = await screen.findByRole('link', { name: /open image in new tab/i })
      expect(linkElement).toHaveAttribute('href', imageUrl)

      const tooltipTitle = screen.getByTestId('tooltip-title')
      expect(tooltipTitle).toBeInTheDocument()
      expect(tooltipTitle.querySelector('img')).toHaveAttribute('src', imageUrl)
    })

    it('renders text when value is not an image URL', () => {
      render(<DriftViewer value={'Some Value'} />)

      const textElement = screen.getByText('Some Value')
      expect(textElement).toBeInTheDocument()
    })

    it('handles empty value gracefully', () => {
      render(<DriftViewer value={null} />)

      const emptyElement = screen.queryByText(/.+/)
      expect(emptyElement).not.toBeInTheDocument()
    })

    it('renders error-free even when image fails to load', async () => {
      render(<DriftViewer value='https://example.com/image.png' />)

      fireEvent.error(await screen.findByAltText('Drift Value Preview'))
      expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
    })
  })
})
