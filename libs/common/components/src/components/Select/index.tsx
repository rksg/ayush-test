import { Select as AntSelect } from 'antd'

import { Check } from '@acx-ui/icons'

import * as UI from './styledComponents'

import type { SelectProps as AntSelectProps } from 'antd'

export interface SelectProps extends AntSelectProps {
  hasDefaultGroup?: boolean
}

export function Select (props: SelectProps) {
  const { hasDefaultGroup, options = [], ...restProps } = props
  const extraClassName = [
    hasDefaultGroup ? 'has-default-group' : '',
    props?.mode === 'multiple' ? 'multiple' : ''
  ].join(' ')

  const isGroupOpt = options?.filter(opt =>
    opt.hasOwnProperty('label') && !opt.hasOwnProperty('value') && Array.isArray(opt.options)
  )?.length > 0

  const selectProps = isGroupOpt ? {
    ...restProps,
    showArrow: true,
    options: options?.map(opt => ({
      label: <span>{opt.label}</span>,
      options: opt.options
    })),
    menuItemSelectedIcon: <Check />,
    dropdownRender: (menu: JSX.Element) =>
      <UI.OptionGroup className={extraClassName}>
        {menu}
      </UI.OptionGroup>
  } : props

  return <AntSelect
    {...selectProps}
  />
}

Select.Option = AntSelect.Option
Select.OptGroup = AntSelect.OptGroup
