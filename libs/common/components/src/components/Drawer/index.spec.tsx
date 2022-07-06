import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'

import { Drawer } from '.'

jest.mock('@acx-ui/icons', ()=> ({
  CloseSymbol: () => <div data-testid='close-symbol'/>
}), { virtual: true })

const onClose = jest.fn()
const resetFields = jest.fn()
const content = <p>some content</p>

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

    const button = screen.getByRole('button', { name: /close/i })
    await screen.findByText('Test Drawer')
    await screen.findByText('some content')

    fireEvent.click(button)
    expect(onClose).toBeCalled()
  })

  it('should render custom drawer correctly', async () => {
    const footer = <>
      <button onClick={onClose} >Save</button>
      <button onClick={resetFields}>Reset</button>
    </>

    render(<Drawer
      title={'Test Custom Drawer'}
      visible={true}
      onClose={onClose}
      content={content}
      mask={false}
      footer={footer}
    />)

    const closeButton = screen.getByRole('button', { name: /close/i })
    const saveButton = screen.getByRole('button', { name: /save/i })
    const resetButton = screen.getByRole('button', { name: /reset/i })

    await screen.findByText('Test Custom Drawer')

    fireEvent.click(closeButton)
    expect(onClose).toBeCalled()

    fireEvent.click(saveButton)
    expect(onClose).toBeCalled()

    fireEvent.click(resetButton)
    expect(resetFields).toBeCalled()
  })
})
