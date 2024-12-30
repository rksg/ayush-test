import userEvent from '@testing-library/user-event'

import { render, screen, waitFor } from '@acx-ui/test-utils'

import { DiagramGallery } from './DiagramGallery'
jest.mock('./styledComponents', () => {
  const OriginControlDot = jest.requireActual('./styledComponents').ControlDot
  return {
    ControlDot: (props: { $active: boolean, onClick: () => void }) =>
      <div data-testid='ControlDot' onClick={props.onClick}>
        {''+props.$active}
        <OriginControlDot {...props}/>
      </div>
  }
})

describe('PIN form > Prerequisite > DiagramGallery', () => {
  it('renders the correct initial diagram', () => {
    render(<DiagramGallery />)
    const image = screen.getByAltText('PIN Topology')
    expect(image.getAttribute('src')).toBe('pin-ap-edge-vertical.svg')
  })

  it('updates the current diagram when a dot is clicked', async () => {
    render(<DiagramGallery />)
    const controlDots = screen.getAllByTestId('ControlDot')
    await userEvent.click(controlDots[1])
    const image = screen.getByAltText('PIN Topology')
    await waitFor(() =>
      expect(image.getAttribute('src')).toBe('pin-switch-edge-vertical.svg'))
    expect(controlDots[1]).toHaveTextContent('true')
  })
})