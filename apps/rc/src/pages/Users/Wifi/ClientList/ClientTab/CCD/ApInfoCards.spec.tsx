import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import { mockApInfoList } from './__tests__/fixtures'
import { ApInfoCards }    from './ApInfoCards'

describe('CCD - AP Info Cards', () => {
  it('should render correctly', async () => {
    const selectedApsInfo = [ ...mockApInfoList ]
    const currentViewApMac = selectedApsInfo[0].apMac
    const currentCcdApMac = selectedApsInfo[1].apMac
    const mockSelectApChanged = jest.fn()

    render(
      <ApInfoCards
        apInfos={selectedApsInfo}
        selectedApMac={currentViewApMac}
        setSelectedApMac={mockSelectApChanged}
        ccdApMac={currentCcdApMac}
      />
    )

    const radioButtons = await screen.findAllByRole('radio')
    expect(radioButtons.length).toBe(3)
    expect(radioButtons[0]).toBeChecked()
    expect(await screen.findByText(selectedApsInfo[0].name)).toBeVisible()

    await userEvent.click(radioButtons[1])
    expect(mockSelectApChanged).toHaveBeenCalled()

  })
})