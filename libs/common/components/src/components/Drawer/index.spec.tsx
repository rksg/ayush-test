import '@testing-library/jest-dom'

import { BulbOutlined }                       from '@acx-ui/icons'
import { render, screen, fireEvent, waitFor } from '@acx-ui/test-utils'

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
    />)
    expect(screen.getAllByRole('dialog')).toMatchSnapshot()
  })

  it('should render test drawer correctly', async () => {
    render(<Drawer
      title={'Test Drawer'}
      visible={true}
      onClose={onClose}
      children={content}
    />)

    const button = screen.getByRole('button', { name: /close/i })
    await screen.findByText('Test Drawer')
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

  it('should close 1st drawer when 2nd opened and cleanup so 2nd can open again', async () => {
    const firstOnClose = jest.fn()
    const secondOnClose = jest.fn()
    const TestComponent = ({ secondDrawerVisible }: { secondDrawerVisible: boolean }) => {
      return <>
        <Drawer
          title={'First Drawer'}
          visible={true}
          onClose={firstOnClose}
          children={content}
        />
        {secondDrawerVisible && <Drawer
          title={'Second Drawer'}
          visible={secondDrawerVisible}
          onClose={secondOnClose}
          children={content}
        />}
      </>
    }
    const { rerender } = render(<TestComponent secondDrawerVisible={false} />)
    rerender(<TestComponent secondDrawerVisible={true} />)
    await waitFor(() => expect(firstOnClose).toBeCalled())
    rerender(<TestComponent secondDrawerVisible={false} />)
    rerender(<TestComponent secondDrawerVisible={true} />)
    expect(await screen.findByText('Second Drawer')).toBeVisible()
    expect(secondOnClose).not.toBeCalled()
  })

  it('should not close 1st drawer if it has footer (is a form)', async () => {
    const firstOnClose = jest.fn()
    const TestComponent = ({ secondDrawerVisible }: { secondDrawerVisible: boolean }) => {
      return <>
        <Drawer
          title={'First Drawer'}
          visible={true}
          onClose={firstOnClose}
          children={content}
          footer={<div />}
        />
        {secondDrawerVisible && <Drawer
          title={'Second Drawer'}
          visible={secondDrawerVisible}
          onClose={onClose}
          children={content}
        />}
      </>
    }
    const { rerender } = render(<TestComponent secondDrawerVisible={false} />)
    rerender(<TestComponent secondDrawerVisible={true} />)
    expect(await screen.findByText('Second Drawer')).toBeVisible()
    expect(firstOnClose).not.toBeCalled()
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
