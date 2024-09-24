import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import { mockedConfigTemplate } from './__tests__/fixtures'
import { DriftInstanceProps }   from './DriftInstance'

import { SelectedCustomersIndicator, ShowDriftsDrawer } from '.'

jest.mock('./DriftInstance', () => ({
  DriftInstance: (props: DriftInstanceProps) => <span>{props.instanceName}</span>
}))

describe('ShowDriftsDrawer', () => {
  it('should render the drawer with the correct content', async () => {
    render(<ShowDriftsDrawer setVisible={jest.fn()} selectedTemplate={mockedConfigTemplate} />)
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('checkbox', { name: /Sync all drifts for all customers/i })).toBeInTheDocument()
    expect(await screen.findByRole('combobox')).toBeInTheDocument()
    expect(await screen.findByText('Edu Hotels')).toBeInTheDocument()
  })

  describe('SelectedCustomersIndicator', () => {
    it('should render the selected customer indicator when the instance is selected', async () => {
      render(<SelectedCustomersIndicator selectedCount={1} />)
      expect(await screen.findByText('1 selected')).toBeInTheDocument()
    })

    it('should render nothing when selectedCount is 0', () => {
      const { container } = render(<SelectedCustomersIndicator selectedCount={0} />)
      // eslint-disable-next-line testing-library/no-node-access
      expect(container.firstChild).toBeNull()
    })
  })

  xit('should call the sync API when the sync button is clicked', async () => {
    render(<ShowDriftsDrawer setVisible={jest.fn()} selectedTemplate={mockedConfigTemplate} />)
    const syncButton = await screen.findByRole('button', { name: 'Sync' })
    await userEvent.click(syncButton)
  })
})
