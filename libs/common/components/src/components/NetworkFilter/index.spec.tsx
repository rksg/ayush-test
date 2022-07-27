import React from 'react'

import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { fireEvent, render, screen, cleanup } from '@acx-ui/test-utils'

import { NetworkFilter, CascaderProps, Option } from './index'

afterEach(cleanup)

describe('NetworkFilter', () => {
  const CustomCascader: React.FC<CascaderProps> = (props: CascaderProps) => (
    <NetworkFilter {...props} />
  )

  it('no data with placeholder', async () => {
    const placeholder = 'test cascader'
    render(<CustomCascader placeholder={placeholder} multiple={false}/>)

    expect(screen.getByText(placeholder)).toBeVisible()

    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.getByText('No Data')).toBeInTheDocument()
  })

  it('single-select, checkboxgroup, onChange & onApply', async () => {
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
    const onChangeMock = jest.fn()
    render(
      <CustomCascader
        options={options} 
        onApply={onApplyMock} 
        multiple={false} 
        onChange={onChangeMock}
        withControlButtons={true}
      />)

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const allOptions = screen.getAllByRole('menuitemcheckbox')
    expect(allOptions).toHaveLength(options.length)

    fireEvent.click(allOptions[0])
    expect(onApplyMock).toBeCalledTimes(1)
    expect(onChangeMock).toBeCalledTimes(1)

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    fireEvent.click(allOptions[1])
    expect(onApplyMock).toBeCalledTimes(2)
    expect(onChangeMock).toBeCalledTimes(2)

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    fireEvent.click(allOptions[2])
    expect(onApplyMock).toBeCalledTimes(3)
    expect(onChangeMock).toBeCalledTimes(3)

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    fireEvent.click(allOptions[3])
    expect(onApplyMock).toBeCalledTimes(4)
    expect(onChangeMock).toBeCalledTimes(4)
  })

  it('flat list, onApply & multi-select', async () => {
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
    expect(onApplyMock).toBeCalledTimes(2)

    expect(await screen.findAllByText(options[0].label as string)).toHaveLength(2)
    expect(await screen.findAllByText(options[1].label as string)).toHaveLength(2)
  })


  it('renders single select & checkboxgroup', async () => {
    const onApplyMock = jest.fn()
    const onChangeMock = jest.fn()
    const radioOptions = ['6 GHz', '5 Ghz', '2.4 Ghz']
    const radioLabel = 'Frequency'
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
    render(
      <CustomCascader
        options={options}
        onApply={onApplyMock}
        onChange={onChangeMock}
        withRadio={{ radioTitle: radioLabel, radioOptions: radioOptions }}
        withControlButtons
      />)

    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.getByText(radioLabel, { exact: false })).toBeInTheDocument()
    const checkboxGroup = screen.getAllByRole('checkbox')
    expect(checkboxGroup).toHaveLength(radioOptions.length)

    checkboxGroup[0].click()
    checkboxGroup[1].click()
    checkboxGroup[0].click()
    expect(onApplyMock).toBeCalledTimes(3)
    expect(onChangeMock).toBeCalledTimes(0)
    expect(checkboxGroup[1]).toBeChecked()
    expect(checkboxGroup[0]).not.toBeChecked()

    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
    screen.getByRole('button', { name: 'Apply' }).click()
    expect(onApplyMock).toBeCalledTimes(4)
    expect(onChangeMock).toBeCalledTimes(0)

    const selectOptions = screen.getAllByRole('menuitemcheckbox')
    selectOptions[0].click()
    selectOptions[1].click()
    selectOptions[0].click()
    expect(onApplyMock).toBeCalledTimes(7)
    expect(onChangeMock).toBeCalledTimes(3)
  })

  it('renders footer button, onCancel, onChange & onFocus test', async () => {
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
    const onCancelMock = jest.fn()
    const onFocusMock = jest.fn()
    const onChangeMock = jest.fn()

    const radioOptions = ['6 GHz', '5 Ghz', '2.4 Ghz']
    const radioLabel = 'Frequency'

    render(
      <CustomCascader
        onApply={onApplyMock}
        onCancel={onCancelMock}
        onFocus={onFocusMock}
        options={options}
        onChange={onChangeMock}
        withRadio={{ radioTitle: radioLabel, radioOptions: radioOptions }}
        multiple
        withControlButtons
      />)

    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    screen.getByRole('button', { name: 'Cancel' }).click()
    expect(onCancelMock).toBeCalledTimes(1)

    screen.getByRole('combobox').click()
    expect(onFocusMock).toBeCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
    screen.getByRole('button', { name: 'Apply' }).click()
    expect(onApplyMock).toBeCalledTimes(1)

    screen.getByRole('combobox').click()
    const filterOptions = screen.getAllByRole('menuitemcheckbox')
    filterOptions[1].click()
    expect(onApplyMock).toBeCalledTimes(2)
    expect(onChangeMock).toBeCalledTimes(1)

    await userEvent.click(await screen.findByRole('combobox'))
    expect(screen.getByText(radioLabel, { exact: false })).toBeInTheDocument()
    const checkboxGroup = screen.getAllByRole('checkbox')
    expect(checkboxGroup).toHaveLength(radioOptions.length)

    checkboxGroup[0].click()
    checkboxGroup[1].click()
    checkboxGroup[0].click()
    expect(onApplyMock).toBeCalledTimes(5)
    expect(onChangeMock).toBeCalledTimes(1)
    expect(checkboxGroup[1]).toBeChecked()
    expect(checkboxGroup[0]).not.toBeChecked()
  })
})


