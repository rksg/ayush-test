import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import { mockApInfoList } from './__tests__/fixtures'
import { ApInfoCards }    from './ApInfoCards'

describe('CCD - AP Info Cards', () => {
  it('should render correctly', async () => {
    const ccdReportApInfoList = [ ...mockApInfoList ]
    const mockSelectApChanged = jest.fn()
    const currentApIndex = ccdReportApInfoList.length - 1

    render(
      <ApInfoCards
        apInfos={ccdReportApInfoList}
        selectedApIndex={currentApIndex}
        onSelectApChanged={mockSelectApChanged}
      />
    )

    const radioButtons = await screen.findAllByRole('radio')
    expect(radioButtons.length).toBe(4)
    expect(radioButtons[currentApIndex]).toBeChecked()
    expect(await screen.findByText(ccdReportApInfoList[currentApIndex].name)).toBeVisible()

    await userEvent.click(radioButtons[0])
    expect(mockSelectApChanged).toHaveBeenCalled()

  })

  it('Radio buttons should be disabled when CCD is running', async () => {
    const ccdReportApInfoList = [ ...mockApInfoList ]
    const mockSelectApChanged = jest.fn()
    const currentApIndex = ccdReportApInfoList.length - 1
    const isTracing = true

    render(
      <ApInfoCards
        apInfos={ccdReportApInfoList}
        disabled={isTracing}
        selectedApIndex={currentApIndex}
        onSelectApChanged={mockSelectApChanged}
      />
    )

    const radioButtons = await screen.findAllByRole('radio')
    expect(radioButtons.length).toBe(4)
    expect(radioButtons[currentApIndex]).toBeChecked()
    expect(radioButtons[0]).toBeDisabled()
    expect(await screen.findByText(ccdReportApInfoList[currentApIndex].name)).toBeVisible()
  })
})