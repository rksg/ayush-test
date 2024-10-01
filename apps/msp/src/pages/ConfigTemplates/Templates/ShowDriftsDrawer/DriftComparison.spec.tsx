import { ConfigTemplateDriftRecord } from '@acx-ui/rc/utils'
import { render, screen }            from '@acx-ui/test-utils'

import { convertDriftDisplayValue, DriftComparison } from './DriftComparison'

describe('DriftComparison', () => {
  const mockData: ConfigTemplateDriftRecord = {
    path: 'WifiNetwork',
    data: {
      template: 'template value',
      instance: 'instance value'
    }
  }

  const mockEmptyTemplateData: ConfigTemplateDriftRecord = {
    path: 'Empty Template',
    data: {
      template: '',
      instance: 'instance value'
    }
  }

  const mockEmptyInstanceData: ConfigTemplateDriftRecord = {
    path: 'Empty Instance',
    data: {
      template: 'template value',
      instance: ''
    }
  }

  it('renders the component with the correct data', () => {
    render(<DriftComparison {...mockData} />)
    expect(screen.getByText('WifiNetwork')).toBeInTheDocument()
    expect(screen.getByText('template value')).toBeInTheDocument()
    expect(screen.getByText('instance value')).toBeInTheDocument()
  })

  it('displays correct background colors when template is empty', () => {
    render(<DriftComparison {...mockEmptyTemplateData} />)
    const instanceCol = screen.getByText('instance value')
    expect(instanceCol).toHaveStyle('background-color: #B4E8C7')

    const templateCol = instanceCol.previousSibling!
    expect(templateCol).toHaveStyle('background-color: #F2F2F2')
  })

  it('displays correct background colors when instance is empty', () => {
    render(<DriftComparison {...mockEmptyInstanceData} />)
    const templateCol = screen.getByText('template value')
    expect(templateCol).toHaveStyle('background-color: #B4E8C7')

    const instanceCol = templateCol.nextSibling!
    expect(instanceCol).toHaveStyle('background-color: #F2F2F2')
  })

  it('displays correct background colors when both are not empty', () => {
    render(<DriftComparison {...mockData} />)
    const templateCol = screen.getByText('template value')
    expect(templateCol).toHaveStyle('background-color: #FBD9AB')

    const instanceCol = screen.getByText('instance value')
    expect(instanceCol).toHaveStyle('background-color: #FBD9AB')
  })

  it('convertDriftDisplayValue', () => {
    expect(convertDriftDisplayValue(null)).toBe('')
    expect(convertDriftDisplayValue(undefined)).toBe('')
    expect(convertDriftDisplayValue('')).toBe('')
    expect(convertDriftDisplayValue(123)).toBe('123')
    expect(convertDriftDisplayValue(true)).toBe('true')
    expect(convertDriftDisplayValue(false)).toBe('false')
    expect(convertDriftDisplayValue('test string')).toBe('test string')
  })
})
