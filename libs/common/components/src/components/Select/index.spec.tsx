import React from 'react'

import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { act }   from 'react-dom/test-utils'

import { fireEvent, render, screen, cleanup } from '@acx-ui/test-utils'

import { Select, CascaderProps, Option } from './index'

afterEach(cleanup)

describe('Select', () => {
  const CustomCascader: React.FC<CascaderProps> = (props: CascaderProps) => (
    <Select {...props} />
  )

  it('renders empty list & placeholder', async () => {
    const placeholder = 'test cascader'
    const onApplyMock = jest.fn()
    render(<CustomCascader
      options={[]}
      placeholder={placeholder}
      multiple={false}
      onApply={onApplyMock}
    />)

    expect(screen.getByText(placeholder)).toBeVisible()

    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.getByText('No Data')).toBeInTheDocument()
  })

  it('renders single select, triggers onApply', async () => {
    const options: Option[] = [
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
      },
      {
        value: 'n5',
        label: 'n5',
        ignoreSelection: true
      }
    ]

    const onApplyMock = jest.fn()
    render(
      <CustomCascader
        options={options}
        onApply={onApplyMock}
        multiple={false}
      />)

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const allOptions = screen.getAllByRole('menuitemcheckbox')
    expect(allOptions).toHaveLength(options.length)

    fireEvent.click(allOptions[0])
    expect(onApplyMock).toBeCalledTimes(1)
    expect(onApplyMock).toHaveBeenCalledWith(['n1'])

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    fireEvent.click(allOptions[1])
    expect(onApplyMock).toBeCalledTimes(2)

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    fireEvent.click(allOptions[4])
    expect(onApplyMock).toBeCalledTimes(2)

  })

  it('renders simple list, triggers onApply with multi-select', async () => {
    const options: Option[] = [
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
      />)

    await userEvent.click(await screen.findByRole('combobox'))
    const allOptions = screen.getAllByRole('menuitemcheckbox')
    expect(allOptions).toHaveLength(options.length)

    await userEvent.click(allOptions[0])
    await userEvent.click(allOptions[1])
    screen.getByRole('button', { name: 'Apply' }).click()
    expect(onApplyMock).toBeCalledTimes(1)
    expect(onApplyMock).toHaveBeenCalledWith([['n1'], ['n2']])
  })

  it('renders simple list with bands, triggers onApply with multi-select', async () => {
    const options: Option[] = [
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
      />)
    await userEvent.click(await screen.findByRole('combobox'))
    const allOptions = screen.getAllByRole('menuitemcheckbox')
    const band6GHz = screen.getByLabelText('6 GHz')
    const band2_4GHz = screen.getByLabelText('2.4 GHz')
    expect(allOptions).toHaveLength(options.length)

    await userEvent.click(allOptions[0])
    await userEvent.click(allOptions[1])
    await userEvent.click(band6GHz)
    await userEvent.click(band2_4GHz)
    expect(asFragment()).toMatchSnapshot()
    screen.getByRole('button', { name: 'Apply' }).click()
    expect(onApplyMock).toBeCalledTimes(1)
    expect(onApplyMock).toHaveBeenCalledWith([['n1'], ['n2']],['6','2.4'])
  })

  it('should render bands disabled, reset default bands and apply', async () => {
    const options: Option[] = [
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
      />)
    await userEvent.click(await screen.findByRole('combobox'))
    expect(asFragment()).toMatchSnapshot()
    expect(onApplyMock).toBeCalledTimes(1)
    expect(onApplyMock).toHaveBeenCalledWith(['n3'],[])
  })

  it('reverts to previous values on cancel', async () => {
    const options: Option[] = [
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
      />)
    await userEvent.click(await screen.findByRole('combobox'))
    const allOptions = screen.getAllByRole('menuitemcheckbox')
    await userEvent.click(allOptions[1])
    screen.getByRole('button', { name: 'Cancel' }).click()
    await userEvent.click(await screen.findByRole('combobox'))
    screen.getByRole('button', { name: 'Apply' }).click()
    expect(onApplyMock).toHaveBeenCalledWith([])
  })

  it('single select handles onClear correctly', async () => {
    const options: Option[] = [
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
      />
    )

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const allOptions = screen.getAllByRole('menuitemcheckbox')
    expect(allOptions).toHaveLength(options.length)

    fireEvent.click(allOptions[0])
    expect(onApplyMock).toBeCalledTimes(1)
    expect(onApplyMock).toHaveBeenCalledWith(['n1'])

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const clearIcon = await screen.findByLabelText('close-circle')
    expect(clearIcon).not.toBeNull()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(() => userEvent.click(clearIcon))
    expect(onClearMock).toBeCalledTimes(1)
    expect(onClearMock).toBeCalledWith()
    expect(onApplyMock).toBeCalledTimes(2)
    expect(onApplyMock).toHaveBeenNthCalledWith(2, [])
  })


  it('multi select handles onClear correctly', async () => {
    const options: Option[] = [
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
        defaultValue={[['n1']]}
        options={options}
        onApply={onApplyMock}
        multiple={true}
        allowClear={true}
        onClear={onClearMock}
      />
    )


    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const allOptions1 = screen.getAllByRole('menuitemcheckbox')
    expect(allOptions1).toHaveLength(options.length)

    fireEvent.click(allOptions1[0])
    fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(onApplyMock).toBeCalledTimes(1)
    expect(onApplyMock).toHaveBeenCalledWith([])


    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const allOptions2 = screen.getAllByRole('menuitemcheckbox')
    fireEvent.click(allOptions2[1])
    fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(onApplyMock).toBeCalledTimes(2)
    expect(onApplyMock).toHaveBeenNthCalledWith(2, [['n2']])

    fireEvent.mouseEnter(await screen.findByRole('combobox'))
    const clearIcon = await screen.findByLabelText('close-circle')
    expect(clearIcon).not.toBeNull()

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(() => userEvent.click(clearIcon))
    expect(onClearMock).toBeCalledTimes(1)
    expect(onClearMock).toBeCalledWith()
    expect(onApplyMock).toBeCalledTimes(3)
    expect(onApplyMock).toHaveBeenNthCalledWith(3, [],[])
  })

})
