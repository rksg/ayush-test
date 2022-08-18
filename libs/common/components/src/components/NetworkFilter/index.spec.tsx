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
})
