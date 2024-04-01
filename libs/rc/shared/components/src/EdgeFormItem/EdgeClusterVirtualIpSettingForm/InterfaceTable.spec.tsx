import userEvent from '@testing-library/user-event'

import { EdgeGeneralFixtures, EdgePortInfo, EdgeStatus } from '@acx-ui/rc/utils'
import { render, screen }                                from '@acx-ui/test-utils'

import { mockVipConfig }  from './__tests__/fixtures'
import { InterfaceTable } from './InterfaceTable'

const { mockEdgeClusterList } = EdgeGeneralFixtures

jest.mock('./SelectInterfaceDrawer', () => ({
  ...jest.requireActual('./SelectInterfaceDrawer'),
  SelectInterfaceDrawer: ({ handleFinish }: {
    handleFinish: (data: { [key: string]: EdgePortInfo | undefined }) => void
  }) => <div data-testid='SelectInterfaceDrawer'>
    <button
      onClick={() => handleFinish(mockVipConfig[0].interfaces)}
    >
      Select Port
    </button>
  </div>
}))

describe('InterfaceTable', () => {
  it('should render InterfaceTable successfully', async () => {
    render(
      <InterfaceTable
        value={mockVipConfig[0].interfaces}
        nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
      />
    )

    expect(screen.getByTestId('SelectInterfaceDrawer')).toBeVisible()
    expect(await screen.findByRole('row', { name: 'Smart Edge 1 Port2 2.2.2.2/ 24' })).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('row', { name: 'Smart Edge 2 Lag1 1.10.10.1/ 16' })).toBeVisible()
  })

  it('should show "Select Interface" button when there is no interface data', async () => {
    render(
      <InterfaceTable
        value={{}}
      />
    )

    expect(await screen.findByRole('button', { name: 'Select interface' })).toBeVisible()
  })

  it('should do handleSelectPort correctly', async () => {
    const onChangeSpy = jest.fn()
    render(
      <InterfaceTable
        onChange={onChangeSpy}
        nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
      />
    )

    expect(screen.getByTestId('SelectInterfaceDrawer')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Select Port' }))
    // eslint-disable-next-line max-len
    expect(onChangeSpy).toHaveBeenCalledWith(mockVipConfig[0].interfaces)
  })

  it('should do clear correctly', async () => {
    const onChangeSpy = jest.fn()
    const onClearSpy = jest.fn()
    render(
      <InterfaceTable
        onChange={onChangeSpy}
        onClear={onClearSpy}
        value={mockVipConfig[0].interfaces}
        nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
      />
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Clear' }))
    // eslint-disable-next-line max-len
    expect(onChangeSpy).toHaveBeenCalledWith(undefined)
    expect(onClearSpy).toHaveBeenCalled()
  })
})