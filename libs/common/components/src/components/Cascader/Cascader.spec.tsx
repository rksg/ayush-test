import React from 'react'

import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { act }   from 'react-dom/test-utils'

import { render, screen, cleanup, waitFor } from '@acx-ui/test-utils'

import { Cascader, CascaderProps, CascaderOption } from './index'

afterEach(cleanup)

describe('Cascader', () => {
  const CustomCascader: React.FC<CascaderProps> = (props: CascaderProps) => (
    <Cascader {...props} />
  )
  const entityName = Cascader.defaultProps.entityName

  it('renders empty list & placeholder', async () => {
    const placeholder = 'test cascader'
    const onApplyMock = jest.fn()
    render(<CustomCascader
      options={[]}
      placeholder={placeholder}
      multiple={false}
      onApply={onApplyMock}
      entityName={entityName}
    />)

    expect(screen.getByText(placeholder)).toBeVisible()

    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.getByText('No Data')).toBeInTheDocument()
  })

  it('renders single select, triggers onApply', async () => {
    const options: CascaderOption[] = [
      {
        value: 'n1',
        label: 'SSID 1'
      },
      {
        value: 'n2',
        label: 'SSID 2',
        children: [
          {
            value: 'n2.1',
            label: 'Ignored',
            ignoreSelection: true,
            children: [
              {
                value: 'n2.1.1',
                label: 'AP 1'
              },
              {
                value: 'n2.1.2',
                label: 'AP 2'
              }
            ]
          }
        ]
      },
      {
        value: 'n3',
        label: 'SSID 3',
        extraLabel: <div data-testid='extra-label'>Extra SSID 3 label</div>
      }
    ]

    const onApplyMock = jest.fn()
    const onVisibleChange = jest.fn()
    const { rerender } = render(<CustomCascader
      options={options}
      onApply={onApplyMock}
      multiple={false}
      onDropdownVisibleChange={onVisibleChange}
      entityName={entityName}
    />)

    await userEvent.click(await screen.findByRole('combobox'))
    const allOptions = screen.getAllByRole('menuitemcheckbox')
    expect(allOptions).toHaveLength(options.length)
    expect(onVisibleChange).toHaveBeenLastCalledWith(true)
    expect(await screen.findByTestId('extra-label')).toHaveTextContent('Extra SSID 3 label')

    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /SSID 1/ }))
    act(() => { screen.getByRole('button', { name: 'Apply' }).click() })
    expect(onApplyMock).toBeCalledTimes(1)
    expect(onApplyMock).toHaveBeenNthCalledWith(1, ['n1'])
    expect(await screen.findAllByText('SSID 1')).toHaveLength(3)
    expect(onVisibleChange).toHaveBeenLastCalledWith(false)

    await userEvent.click(await screen.findByRole('combobox'))
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /SSID 2/ }))
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /Ignored/ }))
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /AP 2/ }))
    act(() => { screen.getByRole('button', { name: 'Apply' }).click() })
    expect(onApplyMock).toBeCalledTimes(2)
    expect(onApplyMock).toHaveBeenNthCalledWith(2, ['n2', 'n2.1', 'n2.1.2'])
    expect(await screen.findAllByText('SSID 2 / Ignored / AP 2')).toHaveLength(2)

    await userEvent.click(await screen.findByRole('combobox'))
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /SSID 2/ }))
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /Ignored/ }))
    act(() => { screen.getByRole('button', { name: 'Apply' }).click() })
    expect(onApplyMock).toBeCalledTimes(3)
    expect(onApplyMock).toHaveBeenNthCalledWith(3, ['n2'])
    rerender(<CustomCascader
      options={options}
      onApply={onApplyMock}
      multiple={false}
      onDropdownVisibleChange={onVisibleChange}
      entityName={entityName}
      value={['n2']}
      defaultValue={['n2']}
    />)
    expect(await screen.findAllByText('SSID 2')).toHaveLength(3)
  })

  it('renders simple list, triggers onApply with multi-select', async () => {
    const options: CascaderOption[] = [
      {
        value: 'n1',
        label: 'SSID 1'
      },
      {
        value: 'n2',
        label: 'SSID 2'
      },
      {
        value: 'n3',
        label: 'SSID 3'
      },
      {
        value: 'n4',
        label: 'SSID 4'
      }
    ]

    const onApplyMock = jest.fn()
    render(
      <CustomCascader
        options={options}
        onApply={onApplyMock}
        multiple={true}
        entityName={entityName}
      />)

    await userEvent.click(await screen.findByRole('combobox'))
    const allOptions = screen.getAllByRole('menuitemcheckbox')
    expect(allOptions).toHaveLength(options.length)

    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /SSID 1/ }))
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /SSID 2/ }))
    act(() => { screen.getByRole('button', { name: 'Apply' }).click() })
    expect(onApplyMock).toBeCalledTimes(1)
    expect(onApplyMock).toHaveBeenCalledWith([['n1'], ['n2']])
  })

  it('renders simple list with bands, triggers onApply with multi-select', async () => {
    const options: CascaderOption[] = [
      {
        value: 'n1',
        label: 'SSID 1'
      },
      {
        value: 'n2',
        label: 'SSID 2'
      },
      {
        value: 'n3',
        label: 'SSID 3'
      },
      {
        value: 'n4',
        label: 'SSID 4'
      }
    ]

    const onApplyMock = jest.fn()
    const { asFragment } = render(
      <CustomCascader
        options={options}
        onApply={onApplyMock}
        showRadioBand={true}
        entityName={entityName}
      />)
    await userEvent.click(await screen.findByRole('combobox'))
    const allOptions = screen.getAllByRole('menuitemcheckbox')
    expect(allOptions).toHaveLength(options.length)
    const band6GHz = screen.getByLabelText('6 GHz')
    const band2_4GHz = screen.getByLabelText('2.4 GHz')

    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /SSID 1/ }))
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /SSID 2/ }))
    await userEvent.click(band6GHz)
    await userEvent.click(band2_4GHz)
    expect(asFragment()).toMatchSnapshot()
    act(() => { screen.getByRole('button', { name: 'Apply' }).click() })
    expect(onApplyMock).toBeCalledTimes(1)
    expect(onApplyMock).toHaveBeenCalledWith([['n1'], ['n2']],['6','2.4'])
  })

  it('should render bands disabled, reset default bands and apply', async () => {
    const options: CascaderOption[] = [
      {
        value: 'n1',
        label: 'SSID 1'
      },
      {
        value: 'n2',
        label: 'SSID 2'
      },
      {
        value: 'n3',
        label: 'SSID 3'
      },
      {
        value: 'n4',
        label: 'SSID 4'
      }
    ]

    const onApplyMock = jest.fn()
    const { asFragment } = render(
      <CustomCascader
        options={options}
        onApply={onApplyMock}
        defaultValue={['n3']}
        showRadioBand={true}
        defaultRadioBand={['5']}
        isRadioBandDisabled={true}
        radioBandDisabledReason={'Disabled for test case.'}
        entityName={entityName}
      />)
    await userEvent.click(await screen.findByRole('combobox'))
    expect(asFragment()).toMatchSnapshot()
    expect(onApplyMock).toBeCalledTimes(1)
    expect(onApplyMock).toHaveBeenCalledWith(['n3'],[])
  })

  it('reverts to previous values on cancel', async () => {
    const options: CascaderOption[] = [
      {
        value: 'n1',
        label: 'SSID 1'
      },
      {
        value: 'n2',
        label: 'SSID 2'
      }
    ]
    const onApplyMock = jest.fn()
    render(
      <CustomCascader
        onApply={onApplyMock}
        options={options}
        multiple
        entityName={entityName}
      />)
    await userEvent.click(await screen.findByRole('combobox'))
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /SSID 1/ }))
    act(() => { screen.getByRole('button', { name: 'Cancel' }).click() })
    await userEvent.click(await screen.findByRole('combobox'))
    act(() => { screen.getByRole('button', { name: 'Apply' }).click() })
    expect(onApplyMock).toHaveBeenCalledWith([])
  })

  it('single select handles onClear correctly', async () => {
    const options: CascaderOption[] = [
      {
        value: 'n1',
        label: 'SSID 1'
      },
      {
        value: 'n2',
        label: 'SSID 2'
      },
      {
        value: 'n3',
        label: 'SSID 3'
      },
      {
        value: 'n4',
        label: 'SSID 4'
      }
    ]

    const onApplyMock = jest.fn()
    const onClearMock = jest.fn()
    render(
      <CustomCascader
        defaultValue={['n1']}
        options={options}
        onApply={onApplyMock}
        multiple={false}
        allowClear={true}
        onClear={onClearMock}
        entityName={entityName}
      />
    )

    await userEvent.click(await screen.findByRole('combobox'))
    const allOptions = screen.getAllByRole('menuitemcheckbox')
    expect(allOptions).toHaveLength(options.length)

    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /SSID 1/ }))
    act(() => { screen.getByRole('button', { name: 'Apply' }).click() })
    expect(onApplyMock).toBeCalledTimes(1)
    expect(onApplyMock).toHaveBeenNthCalledWith(1, ['n1'])

    await userEvent.click(await screen.findByRole('combobox'))
    const clearIcon = await screen.findByLabelText('close-circle')
    expect(clearIcon).not.toBeNull()
    await userEvent.click(clearIcon)
    expect(onClearMock).toBeCalledTimes(1)
    expect(onClearMock).toHaveBeenCalledWith()
    expect(onApplyMock).toBeCalledTimes(2)
    expect(onApplyMock).toHaveBeenNthCalledWith(2, [])
  })

  describe('multi select handles onClear correctly', () => {
    const options: CascaderOption[] = [
      {
        value: 'n1',
        label: 'SSID 1'
      },
      {
        value: 'n2',
        label: 'SSID 2'
      },
      {
        value: 'n3',
        label: 'SSID 3'
      },
      {
        value: 'n4',
        label: 'SSID 4'
      }
    ]
    const onApplyMock = jest.fn()
    const onClearMock = jest.fn()

    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('with no radio bands', async () => {
      render(
        <CustomCascader
          defaultValue={[['n1']]}
          options={options}
          onApply={onApplyMock}
          multiple={true}
          allowClear={true}
          onClear={onClearMock}
          entityName={entityName}
        />
      )

      await userEvent.click(await screen.findByRole('combobox'))
      const allOptions1 = screen.getAllByRole('menuitemcheckbox')
      expect(allOptions1).toHaveLength(options.length)

      await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /SSID 1/ }))
      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(onApplyMock).toBeCalledTimes(1)
      expect(onApplyMock).toHaveBeenNthCalledWith(1, [])

      await userEvent.click(await screen.findByRole('combobox'))
      await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /SSID 2/ }))
      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(onApplyMock).toBeCalledTimes(2)
      expect(onApplyMock).toHaveBeenNthCalledWith(2, [['n2']])

      await userEvent.click(await screen.findByRole('combobox'))
      const clearIcon = await screen.findByLabelText('close-circle')
      expect(clearIcon).not.toBeNull()

      await userEvent.click(clearIcon)
      expect(onClearMock).toBeCalledTimes(1)
      expect(onClearMock).toHaveBeenCalledWith()
      expect(onApplyMock).toBeCalledTimes(3)
      expect(onApplyMock).toHaveBeenNthCalledWith(3, [])
    })

    it('with radio bands', async () => {
      render(
        <CustomCascader
          defaultValue={[['n1']]}
          options={options}
          onApply={onApplyMock}
          multiple={true}
          allowClear={true}
          onClear={onClearMock}
          entityName={entityName}
          showRadioBand
        />
      )

      const clearIcon = await screen.findByLabelText('close-circle')
      await userEvent.click(clearIcon)
      expect(onClearMock).toBeCalledTimes(1)
      expect(onClearMock).toHaveBeenCalledWith()
      expect(onApplyMock).toBeCalledTimes(1)
      expect(onApplyMock).toHaveBeenNthCalledWith(1, [], [])
    })
  })

  describe('search', () => {
    const options: CascaderOption[] = [
      {
        value: 'n1',
        label: 'Match search 1'
      },
      {
        value: 'n2',
        label: 'Something else 2'
      },
      {
        value: 'n3',
        label: 'Something else 3',
        children: [
          {
            value: 'n3.1',
            label: 'Match search 3.1'
          }
        ]
      },
      {
        value: 'n4',
        label: 'Match search 4',
        children: [
          {
            value: 'n4.1',
            label: 'Something else 4.1'
          },
          {
            value: 'n4.2',
            label: 'Something else 4.2'
          }
        ]
      },
      {
        value: 'n5',
        label: 'Match search but ignored',
        ignoreSelection: true
      }
    ]
    const onApplyMock = jest.fn()

    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('can search single', async () => {
      render(<CustomCascader
        options={options}
        onApply={onApplyMock}
        entityName={entityName}
      />)

      const combobox = await screen.findByRole('combobox')
      await userEvent.type(combobox, 'Match search')
      const allOptions = screen.getAllByRole('menuitemcheckbox')
      expect(allOptions).toHaveLength(3)

      await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /Match search 1/ }))
      act(() => { screen.getByRole('button', { name: 'Apply' }).click() })
      expect(onApplyMock).toBeCalledTimes(1)
      expect(onApplyMock).toHaveBeenNthCalledWith(1, ['n1'])

      await userEvent.type(combobox, 'Match search')
      await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /Match search 3.1/ }))
      act(() => { screen.getByRole('button', { name: 'Apply' }).click() })
      expect(onApplyMock).toBeCalledTimes(2)
      expect(onApplyMock).toHaveBeenNthCalledWith(2, ['n3', 'n3.1'])

      await userEvent.type(combobox, 'Match search')
      await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /Match search 4/ }))
      await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /Something else 4.2/ }))
      act(() => { screen.getByRole('button', { name: 'Apply' }).click() })
      expect(onApplyMock).toBeCalledTimes(3)
      expect(onApplyMock).toHaveBeenNthCalledWith(3, ['n4', 'n4.2'])
    })

    it('can search multiple', async () => {
      render(<CustomCascader
        options={options}
        onApply={onApplyMock}
        entityName={entityName}
        multiple
      />)

      const combobox = await screen.findByRole('combobox')
      await userEvent.type(combobox, 'Match search')
      const allOptions = screen.getAllByRole('menuitemcheckbox')
      expect(allOptions).toHaveLength(3)

      await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /Match search 1/ }))
      act(() => { screen.getByRole('button', { name: 'Apply' }).click() })
      expect(onApplyMock).toBeCalledTimes(1)
      expect(onApplyMock).toHaveBeenNthCalledWith(1, [['n1']])

      await userEvent.type(combobox, 'Match search')
      await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /Match search 3.1/ }))
      act(() => { screen.getByRole('button', { name: 'Apply' }).click() })
      expect(onApplyMock).toBeCalledTimes(2)
      expect(onApplyMock).toHaveBeenNthCalledWith(2, [['n1'], ['n3']])

      await userEvent.type(combobox, 'Match search')
      await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /Match search 4/ }))
      await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /Something else 4.2/ }))
      act(() => { screen.getByRole('button', { name: 'Apply' }).click() })
      expect(onApplyMock).toBeCalledTimes(3)
      expect(onApplyMock).toHaveBeenNthCalledWith(3, [['n1'], ['n3'], ['n4', 'n4.2']])
    })
  })

  it('cancels on hide', async () => {
    const options: CascaderOption[] = [
      {
        value: 'n1',
        label: 'SSID 1'
      },
      {
        value: 'n2',
        label: 'SSID 2'
      }
    ]
    const onApplyMock = jest.fn()
    render(
      <CustomCascader
        options={options}
        onApply={onApplyMock}
        allowClear={true}
        entityName={entityName}
        multiple
      />
    )

    const combobox = await screen.findByRole('combobox')
    await userEvent.click(combobox)
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /SSID 1/ }))
    act(() => { screen.getByRole('button', { name: 'Apply' }).click() })
    await userEvent.click(combobox)
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /SSID 2/ }))
    await userEvent.click(document.body)
    expect(await screen.findAllByTitle('SSID 1')).toHaveLength(2)
  })

  it('allows use of left arrow when searching', async () => {
    const options: CascaderOption[] = [
      {
        value: 'n1',
        label: 'SSID 1'
      },
      {
        value: 'n2',
        label: 'SSID 2'
      }
    ]
    const placeholder = 'test cascader'
    const onApplyMock = jest.fn()
    render(<CustomCascader
      options={options}
      placeholder={placeholder}
      multiple={true}
      onApply={onApplyMock}
      entityName={entityName}
      showSearch
    />)

    const combobox = await screen.findByRole('combobox')
    await userEvent.type(combobox, 'SSID')
    expect(await screen.findAllByText('SSID')).toHaveLength(3)
    await userEvent.keyboard('[ArrowLeft][Delete]D[ArrowRight]')
    // keyboard events don't trigger onDropdownVisibleChange
    // simulate menu is kept open after left arrow and that menu item can be clicked
    await userEvent.click(document.body)
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /SSID 1/ }))
  })

  it('cancels on escape after use of left arrow', async () => {
    const options: CascaderOption[] = [
      {
        value: 'n1',
        label: 'SSID 1',
        children: [
          {
            value: 'n1.1',
            label: 'Ignored',
            ignoreSelection: true,
            children: [
              {
                value: 'n1.1.1',
                label: 'AP 1'
              },
              {
                value: 'n1.1.2',
                label: 'AP 2'
              }
            ]
          }
        ]
      },
      {
        value: 'n2',
        label: 'SSID 2'
      },
      {
        value: 'n3',
        label: 'SSID 3'
      }
    ]
    const onApplyMock = jest.fn()
    render(
      <CustomCascader
        options={options}
        onApply={onApplyMock}
        allowClear={true}
        entityName={entityName}
        multiple
      />
    )

    const combobox = await screen.findByRole('combobox')
    await userEvent.click(combobox)
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /SSID 2/ }))
    act(() => { screen.getByRole('button', { name: 'Apply' }).click() })
    expect(await screen.findAllByTitle('SSID 2')).toHaveLength(2)
    await userEvent.click(combobox)
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /SSID 3/ }))
    await userEvent.type(combobox, 'SSID[ArrowRight][ArrowLeft][Escape]')
    // keyboard events don't trigger onDropdownVisibleChange
    // simulate menu closed after Escape is pressed and SSID 3 removed due to cancel
    await userEvent.click(document.body)
    expect(await screen.findAllByTitle('SSID 2')).toHaveLength(2)
  })

  it('handles labels that are components', async () => {
    const options: CascaderOption[] = [
      {
        value: 'n1',
        label: <div data-testid='test-label'>SSID 1</div>
      }
    ]

    const onApplyMock = jest.fn()
    render(<CustomCascader
      options={options}
      onApply={onApplyMock}
      entityName={entityName}
    />)

    const combobox = await screen.findByRole('combobox')
    await userEvent.click(combobox)
    expect(await screen.findByTestId('test-label')).toHaveTextContent('SSID 1')

    await userEvent.type(combobox, 'SSID 1')
    // search not supported with typeof label !== string and no displayLabel provided
    await waitFor(() => { expect(screen.queryByTestId('test-label')).toBeNull() })
  })

  it('handles lazy loading (search and extraLabel not supported)', async () => {
    const options: CascaderOption[] = [
      {
        value: 'n1',
        label: <div data-testid='test-label'>SSID 1</div>,
        isLeaf: false
      }
    ]

    const loadDataMock = jest.fn()
    render(<CustomCascader
      options={options}
      onApply={jest.fn()}
      loadData={loadDataMock}
      entityName={entityName}
    />)

    await userEvent.click(await screen.findByRole('combobox'))
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /SSID 1/ }))
    act(() => { screen.getByRole('button', { name: 'Apply' }).click() })
    expect(loadDataMock).toHaveBeenCalledWith(options)
  })
})
