import '@testing-library/jest-dom'

import { useState } from 'react'

import { BulbOutlined }              from '@acx-ui/icons'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { Drawer } from '.'

const onClose = jest.fn()
const resetFields = jest.fn()
const content = <p>some content</p>

describe('Drawer', () => {
  afterEach(() => jest.resetAllMocks())

  it('should match snapshot for basic drawer', () => {
    render(<Drawer
      title={'Test Drawer'}
      visible={true}
      onClose={onClose}
      children={content}
      mask={false}
    />)
    expect(screen.getAllByRole('dialog')).toMatchSnapshot()
  })

  it('should match snapshot for custom drawer', () => {
    render(<Drawer
      title={'Test Drawer'}
      icon={<BulbOutlined/>}
      subTitle={'Test Drawer Subtitle'}
      onBackClick={jest.fn()}
      visible={true}
      onClose={onClose}
      children={content}
      mask={false}
    />)
    expect(screen.getAllByRole('dialog')).toMatchSnapshot()
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

  it('should render drawer without mask attribute correctly', async () => {
    render(<Drawer
      title={'Test Mask Drawer'}
      visible={true}
      onClose={onClose}
      children={content}
    />)

    const button = screen.getByRole('button', { name: /close/i })
    await screen.findByText('Test Mask Drawer')
    await screen.findByText('some content')

    fireEvent.click(button)
    expect(onClose).toBeCalled()
  })

  it('should render custom drawer correctly', async () => {
    const footer = [
      <button onClick={onClose} >Save</button>,
      <button onClick={resetFields}>Reset</button>
    ]
    const handleBackClick = jest.fn()
    render(<Drawer
      title={'Test Custom Drawer'}
      icon={<BulbOutlined/>}
      subTitle={'Test Custom DrawerSubtitle'}
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
    await screen.findAllByTestId('BulbOutlined')
    await screen.findAllByTestId('ArrowBack')
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

  it('should handle close on outside click correctly', async () => {
    const TestWrapper = () => {
      const [visible, setVisible] = useState(true)
      const _close = () => {
        onClose()
        setVisible(false)
      }
      return <div>
        extra element
        <div>
          <div>extra sibling element</div>
          <Drawer
            title={'Test Drawer'}
            visible={visible}
            onClose={_close}
            children={content}
            mask={false}
          />
        </div>
      </div>
    }
    render(<TestWrapper />)

    const drawerTitle = await screen.findByText('some content')
    fireEvent.mouseDown(drawerTitle)
    expect(onClose).not.toBeCalled()

    const extraElement = await screen.findByText('extra element')
    fireEvent.mouseDown(extraElement)
    expect(onClose).toBeCalled()
  })

  it('should keep default behavior with mask on', async () => {
    const TestWrapper = () => {
      const [visible, setVisible] = useState(true)
      const _close = () => {
        onClose()
        setVisible(false)
      }
      return <div>
        extra element
        <div>
          <div>extra sibling element</div>
          <Drawer
            title={'Test Drawer'}
            visible={visible}
            onClose={_close}
            children={content}
            mask={true}
          />
        </div>
      </div>
    }
    render(<TestWrapper />)

    const extraElement = await screen.findByText('extra element')
    fireEvent.mouseDown(extraElement)
    expect(onClose).not.toHaveBeenCalled()
  })

  describe('FormFooter', () => {
    it('should render form footer', async () => {
      const mockOnCancel = jest.fn()
      const mockOnSave = jest.fn()

      const { asFragment } = render(
        <Drawer.FormFooter
          onCancel={mockOnCancel}
          onSave={async (checked) => {
            mockOnSave(checked)

            // Simulate the async request to verify the loading indicator
            await new Promise(r => setTimeout(r, 500))
          }}
        />
      )
      expect(asFragment()).toMatchSnapshot()
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))
      expect(mockOnSave).toBeCalledWith(false)

      expect(await screen.findByRole('button', { name: 'loading Save' })).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(mockOnCancel).toBeCalled()
    })

    it('should handle add another checkbox events', async () => {
      const mockOnCancel = jest.fn()
      const mockOnSave = jest.fn()
      mockOnSave.mockReturnValue(Promise.resolve())

      render(
        <Drawer.FormFooter
          showAddAnother={true}
          onCancel={mockOnCancel}
          onSave={mockOnSave}
          buttonLabel={{
            addAnother: 'Checkbox',
            cancel: 'Back',
            save: 'OK'
          }}
        />
      )
      const addAnother = screen.getByRole('checkbox', { name: 'Checkbox' })
      expect(addAnother).not.toBeChecked()
      fireEvent.click(addAnother)
      expect(addAnother).toBeChecked()
      fireEvent.click(screen.getByRole('button', { name: 'OK' }))
      expect(mockOnSave).toBeCalledWith(true)
      fireEvent.click(screen.getByRole('button', { name: 'Back' }))
      expect(mockOnCancel).toBeCalled()
    })
  })
})
