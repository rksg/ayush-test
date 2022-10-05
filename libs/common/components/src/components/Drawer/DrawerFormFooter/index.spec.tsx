import { DrawerFormFooter } from "@acx-ui/components"
import { render, screen, waitFor } from "@acx-ui/test-utils"
import userEvent from "@testing-library/user-event"


describe('DrawerFormFooter', () => {
  it('should render footer', () => {
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

    waitFor(() => {
      expect(screen.getByRole('checkbox', { name: /Add another/i })).toBeInTheDocument()
    })
  })
})
