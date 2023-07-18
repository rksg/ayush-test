import userEvent from '@testing-library/user-event'

import {
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import {
  mockedConnectionRootToMesh,
  mockedConnectionMeshToMesh,
  mockedWiredConnection
} from './__tests__/fixtures'

import ApMeshConnectionTooltip from '.'


describe('ApMeshConnectionTooltip', () => {
  it('should render Mesh connection info for Root to Mesh', async () => {
    const onVisibleChangeFn = jest.fn()

    render(
      <>
        <div data-testid='outerElementForClosingPopover'>Click Me to close the popover</div>
        <div>
          <span>Mocked Element for popover display</span>
          <ApMeshConnectionTooltip
            data={mockedConnectionRootToMesh}
            onVisibleChange={onVisibleChangeFn}
          />
        </div>
      </>
    )

    const tooltipElement = await screen.findByRole('tooltip')
    expect(await within(tooltipElement).findByText('Root to Mesh:')).toBeInTheDocument()
    expect(await within(tooltipElement).findByText('60')).toHaveStyle('color: #23AB36')
    expect(await within(tooltipElement).findByText('20')).toHaveStyle('color: #F9C34B')

    await userEvent.click(screen.getByTestId('outerElementForClosingPopover'))

    expect(onVisibleChangeFn).toHaveBeenCalled()
  })

  it('should render Mesh connection info for Mesh to Mesh', async () => {
    render(
      <div>
        <span>Mocked Element for popover display</span>
        <ApMeshConnectionTooltip data={mockedConnectionMeshToMesh} onVisibleChange={jest.fn()} />
      </div>
    )

    const tooltipElement = await screen.findByRole('tooltip')
    const fromId = 'AP-' + mockedConnectionMeshToMesh.fromName
    const toId = 'AP-' + mockedConnectionMeshToMesh.toName
    const expectedFromToIds = `${fromId} to ${toId}:`
    expect(await within(tooltipElement).findByText(expectedFromToIds)).toBeInTheDocument()
  })

  it('should render Mesh connection info for Ethernet link', async () => {
    render(
      <div>
        <span>Mocked Element for popover display</span>
        <ApMeshConnectionTooltip data={mockedWiredConnection} onVisibleChange={jest.fn()} />
      </div>
    )

    const tooltipElement = await screen.findByRole('tooltip')
    expect(await within(tooltipElement).findByText('Ethernet link')).toBeInTheDocument()
  })
})
