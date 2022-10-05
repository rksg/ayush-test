import { render, screen, waitFor } from '@acx-ui/test-utils'

import { DrawerFormFooter } from '.'


describe('DrawerFormFooter', () => {
  it('should render footer', async () => {
    const { asFragment, rerender } = render(
      <DrawerFormFooter
        onCancel={jest.fn()}
        onSave={jest.fn()} />
    )

    expect(asFragment()).toMatchSnapshot()

    rerender(
      <DrawerFormFooter
        showAddAnother={true}
        onCancel={jest.fn()}
        onSave={jest.fn()} />
    )

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: /Add another/i })).toBeInTheDocument()
    })
  })
})
