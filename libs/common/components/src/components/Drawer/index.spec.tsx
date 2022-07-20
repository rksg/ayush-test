import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'

import { BulbOutlined } from '@acx-ui/icons'

import { Drawer } from '.'


jest.mock('@acx-ui/icons', ()=> ({
  CloseSymbol: () => <div data-testid='close-symbol'/>,
  ArrowBack: () => <div data-testid='arrow-back'/>,
  BulbOutlined: () => <div data-testid='icon'/>
}), { virtual: true })

const onClose = jest.fn()
const resetFields = jest.fn()
const content = <p>some content</p>

describe('Drawer', () => {
  it('should match snapshot for basic drawer', () => {
    render(<Drawer
      title={'Test Drawer'}
      visible={true}
      onClose={onClose}
      children={content}
      mask={false}
      data-testid={'basic-drawer'}
    />)
    expect(screen.getByTestId('basic-drawer')).toMatchSnapshot()
  })

  it('should match snapshot for custom drawer', () => {
    render(<Drawer
      title={'Test Drawer'}
      icon={<BulbOutlined/>}
      subtitle={'Test Drawer Subtitle'}
      onBackClick={jest.fn()}
      visible={true}
      onClose={onClose}
      children={content}
      mask={false}
      data-testid={'custom-drawer'}
    />)
    expect(screen.getByTestId('custom-drawer')).toMatchSnapshot()
  })

  it('should render test drawer correctly', async () => {
    render(<Drawer
      title={'Test Drawer'}
      visible={true}
      onClose={onClose}
      children={content}
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
    const handleBackClick = jest.fn()
    render(<Drawer
      title={'Test Custom Drawer'}
      icon={<BulbOutlined/>}
      subtitle={'Test Custom DrawerSubtitle'}
      onBackClick={handleBackClick}
      visible={true}
      onClose={onClose}
      children={content}
      mask={false}
      footer={footer}
    />)

    const closeButton = screen.getByRole('button', { name: /close/i })
    const saveButton = screen.getByRole('button', { name: /save/i })
    const resetButton = screen.getByRole('button', { name: /reset/i })
    const backButton = screen.getByText('Back')

    await screen.findByText('Test Custom Drawer')
    await screen.findByText('Test Custom DrawerSubtitle')
    await screen.findAllByTestId('icon')
    await screen.findAllByTestId('arrow-back')
    await screen.findByText('Back')

    fireEvent.click(closeButton)
    expect(onClose).toBeCalled()

    fireEvent.click(saveButton)
    expect(onClose).toBeCalled()

    fireEvent.click(resetButton)
    expect(resetFields).toBeCalled()

    fireEvent.click(backButton)
    expect(handleBackClick).toBeCalled()
  })
})
