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

  it('renders no data, with placeholder', async () => {
    const placeholder = 'test cascader'
    render(<CustomCascader placeholder={placeholder} />)

    expect(await screen.findByText(placeholder)).toBeVisible()

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    expect(screen.getByText('No Data')).toBeInTheDocument()
  })

  it('renders single list, single select, onApply called onChange', async () => {
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
    render(<CustomCascader options={options} onApply={onApplyMock} />)

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const allOptions = screen.getAllByRole('menuitemcheckbox')
    expect(allOptions).toHaveLength(options.length)

    fireEvent.click(allOptions[0])
    expect(onApplyMock).toBeCalledTimes(1)

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    fireEvent.click(allOptions[1])

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    fireEvent.click(allOptions[2])

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    fireEvent.click(allOptions[3])
    expect(onApplyMock).toBeCalledTimes(4)
  })

  it('renders single list, multi select, onApply called onChange', async () => {
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
    render(<CustomCascader options={options} onApply={onApplyMock} multiple={true} />)

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
    const radioOptions = ['6 GHz', '5 Ghz', '2.4 Ghz']
    const radioLabel = 'Frequency'
    render(
      <CustomCascader
        onApply={onApplyMock}
        withRadio={{ radioTitle: radioLabel, radioOptions: radioOptions }}
      />)

    await userEvent.click(await screen.findByRole('combobox'))
    expect(screen.getByText(radioLabel, { exact: false })).toBeInTheDocument()
    const checkboxGroup = screen.getAllByRole('checkbox')
    expect(checkboxGroup).toHaveLength(radioOptions.length)

    await userEvent.click(checkboxGroup[0])
    await userEvent.click(checkboxGroup[1])
    await userEvent.click(checkboxGroup[0])
    expect(onApplyMock).toBeCalledTimes(3)
    expect(checkboxGroup[1]).toBeChecked()
    expect(checkboxGroup[0]).not.toBeChecked()
  })

  it('renders footer button', async () => {
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
        onApply={onApplyMock}
        options={options}
        multiple
        withControlButtons
      />)

    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
  })
})


