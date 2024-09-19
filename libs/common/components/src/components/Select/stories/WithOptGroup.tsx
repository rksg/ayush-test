import { useState } from 'react'

import { Space } from 'antd'

import { Select } from '..'

import { defaultProps, defaultOption } from './stories'

export function WithOptGroup () {
  const [optionsSelected, setOptionsSelected] = useState([])
  // const maxSelected = 1

  // const options = useMemo(() => {
  //   const isMaxSelected = optionsSelected.length === maxSelected;

  //   return defaultOption.map((option) => ({
  //     ...option,
  //     // Disable/enable unselected items to prevent/allow selection
  //     ...(!optionsSelected.includes(option.value) && {
  //       disabled: isMaxSelected,
  //     }),
  //   }));
  // }, [defaultOption, maxSelected, optionsSelected]);

  return <Space>
    <div>
      <p>Single:</p>
      <Select
        {...defaultProps}
        open
      >
        <Select.OptGroup
          key='group1'
          label='Group 1'
          children={defaultOption?.map(option => <Select.Option
            key={option.value}
            value={option.value}
            children={option.label}
          />)}
        />
        <Select.OptGroup
          key='group2'
          label='Group 2'
          children={defaultOption?.map(option => <Select.Option
            key={option.value * 4}
            value={option.value * 4}
            children={option.label}
          />)}
        />
      </Select>
    </div>

    <div>
      <p>Radio:</p>
      <Select
        {...defaultProps}
        // mode='multiple'
        $maxCount={1}
        open
      >
        <Select.OptGroup
          key='group1'
          label='Group 1'
          children={defaultOption?.map(option => <Select.Option
            key={option.value}
            value={option.value}
            children={option.label}
          />)}
        />
        <Select.OptGroup
          key='group2'
          label='Group 2'
          children={defaultOption?.map(option => <Select.Option
            key={option.value * 4}
            value={option.value * 4}
            children={option.label}
          />)}
        />
      </Select>
    </div>

    <div>
      <p>Radio:</p>
      <Select
        {...defaultProps}
        mode='multiple'
        $maxCount={1}
        open
        onChange={(value) => {
          setOptionsSelected(value)
        }}
      >
        <Select.OptGroup
          key='group1'
          label='Group 1'
          children={defaultOption?.map(option => <Select.Option
            key={option.value}
            value={option.value}
            children={option.label}
            disabled={optionsSelected?.length >= 1 && !optionsSelected.includes(option.value)}
          />)}
        />
        <Select.OptGroup
          key='group2'
          label='Group 2'
          children={defaultOption?.map(option => <Select.Option
            key={option.value * 4}
            value={option.value * 4}
            children={option.label}
            disabled={optionsSelected?.length >= 1 && !optionsSelected.includes(option.value * 4)}
          />)}
        />
      </Select>
    </div>

    <div>
      <p>Multiple:</p>
      <Select
        {...defaultProps}
        mode='multiple'
        open
      >
        <Select.OptGroup
          key='group1'
          label='Group 1'
          children={defaultOption?.map(option => <Select.Option
            key={option.value}
            value={option.value}
            children={option.label}
          />)}
        />
        <Select.OptGroup
          key='group2'
          label='Group 2'
          children={defaultOption?.map(option => <Select.Option
            key={option.value * 4}
            value={option.value * 4}
            children={option.label}
          />)}
        />
      </Select>
    </div>
  </Space>
}
