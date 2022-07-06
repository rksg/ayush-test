import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'

import { Drawer } from '.'

jest.mock('@acx-ui/icons', ()=> ({
  CloseSymbol: () => <div data-testid='close-symbol'/>
}), { virtual: true })

const onClose = jest.fn()
const content = <><p>some content</p></>

describe('Drawer', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(<Drawer
      title={'Test Drawer'}
      visible={true}
      onClose={onClose}
      content={content}
      mask={false}
    />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render test drawer correctly', async () => {
    render(<Drawer
      title={'Test Drawer'}
      visible={true}
      onClose={onClose}
      content={content}
      mask={false}
    />)

    const button = await screen.getByRole('button', { name: /close/i })
    await screen.findByText('Test Drawer')
    await screen.findByText('some content')

    fireEvent.click(button)
    expect(onClose).toBeCalled()
  })
})