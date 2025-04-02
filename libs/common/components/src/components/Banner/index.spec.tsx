import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { Banner } from './index'
describe('Banner Component', () => {
  it('should open the documentation link when the button is clicked', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => {return null})
    const helpUrl = 'http://test.com'

    render(<Banner
      title='Test'
      subTitles={['subTitle1', 'subTitle2']}
      helpUrl={helpUrl} />)

    const button = screen.getByRole('button', { name: /Learn More/i })
    fireEvent.click(button)
    expect(openSpy).toHaveBeenCalledWith(helpUrl, '_blank')
    expect(screen.getByText('Test')).toBeVisible()
    expect(screen.getByText('subTitle1')).toBeVisible()
    expect(screen.getByText('subTitle2')).toBeVisible()
    openSpy.mockClear()
  })

  it('should disabled learn more button when disabled prop is true', () => {
    const helpUrl = 'http://test.com'

    render(<Banner
      title='Test'
      subTitles={['subTitle1', 'subTitle2']}
      helpUrl={helpUrl}
      disabled/>)

    const button = screen.getByRole('button', { name: /Learn More/i })
    expect(button).toBeDisabled()
  })
})