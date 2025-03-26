import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'

import { EdgePinFixtures, PersonalIdentityNetworks } from '@acx-ui/rc/utils'
import { render, screen }                            from '@acx-ui/test-utils'

import { PinDetailTableGroupTabType } from '../type'

import { diagramItemInfo } from './configs'

import TopologyDiagram from './'


const mockPinData = EdgePinFixtures.mockPinData as unknown as PersonalIdentityNetworks

describe('TopologyDiagram', () => {
  it('should have loader when isLoading is true', () => {
    const props = {
      pinData: undefined,
      apCount: 6,
      identityCount: 6,
      onClick: jest.fn(),
      isLoading: true
    }

    render(<TopologyDiagram {...props} />)
    screen.getByRole('img', { name: 'loader' })
    expect(screen.getByTestId('diagram')).toBeInTheDocument()
  })

  it('renders without errors', () => {
    const props = {
      pinData: mockPinData,
      apCount: 100,
      identityCount: 1,
      onClick: jest.fn()
    }

    render(<TopologyDiagram {...props} />)
    expect(screen.getByTestId('diagram')).toBeInTheDocument()
    const labels = screen.getAllByTestId('diagramLabel')
    expect(labels).toHaveLength(6)
    expect(labels[0].textContent).toBe('Identity: 1')
    expect(labels[1].textContent).toBe('Network: 2')
    expect(labels[2].textContent).toBe('Access Point: 100')
    expect(labels[3].textContent).toBe('Access Switch: 1')
    expect(labels[4].textContent).toBe('Dist. Switch: 1')
    expect(labels[5].textContent).toBe('RUCKUS Edge')

    const controlFrames = screen.getAllByTestId('diagramControlFrame')
    expect(controlFrames).toHaveLength(5)
  })

  it('should skip updatePinInfo when pinData is undefined', () => {
    const props = {
      pinData: undefined,
      apCount: 6,
      identityCount: 6,
      onClick: jest.fn()
    }

    render(<TopologyDiagram {...props} />)
    expect(screen.getByTestId('diagram')).toBeInTheDocument()
    const labels = screen.getAllByTestId('diagramLabel')
    expect(labels).toHaveLength(6)
    expect(labels[0].textContent).toBe('Identity: 6')
    expect(labels[1].textContent).toBe('')
    expect(labels[2].textContent).toBe('Access Point: 6')
    expect(labels[3].textContent).toBe('')
    expect(labels[4].textContent).toBe('')
    expect(labels[5].textContent).toBe('RUCKUS Edge')

    const controlFrames = screen.getAllByTestId('diagramControlFrame')
    expect(controlFrames).toHaveLength(5)
  })

  it('should skip id that is not in GraphRefInterface', () => {
    const originValues = cloneDeep(diagramItemInfo)
    diagramItemInfo[0].controlFrame!.id = 'testFrame'
    diagramItemInfo[0].label.id = 'testLabel'

    const props = {
      pinData: mockPinData,
      apCount: 0,
      identityCount: 0,
      onClick: jest.fn()
    }

    render(<TopologyDiagram {...props} />)
    const labels = screen.getAllByTestId('diagramLabel')
    expect(labels).toHaveLength(5)
    expect(labels[0].textContent).toBe('Network: 2')

    const controlFrames = screen.getAllByTestId('diagramControlFrame')
    expect(controlFrames).toHaveLength(4)
    diagramItemInfo[0] = originValues[0]
  })


  it('calls onClick when control frame is clicked', async () => {
    const props = {
      pinData: mockPinData,
      apCount: 0,
      identityCount: 0,
      onClick: jest.fn()
    }

    render(<TopologyDiagram {...props} />)
    const controlFrames = screen.getAllByTestId('diagramControlFrame')
    await userEvent.click(controlFrames[0])
    expect(props.onClick).toBeCalledWith(PinDetailTableGroupTabType.IDENTITY)

    await userEvent.click(controlFrames[1])
    expect(props.onClick).toBeCalledWith(PinDetailTableGroupTabType.NETWORK)

    await userEvent.click(controlFrames[2])
    expect(props.onClick).toBeCalledWith(PinDetailTableGroupTabType.AP)

    await userEvent.click(controlFrames[3])
    expect(props.onClick).toBeCalledWith(PinDetailTableGroupTabType.AS)

    await userEvent.click(controlFrames[4])
    expect(props.onClick).toBeCalledWith(PinDetailTableGroupTabType.DS)
  })
})