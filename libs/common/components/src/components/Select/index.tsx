import { Select as AntSelect } from 'antd'

import { Check } from '@acx-ui/icons'

import type { SelectProps as AntSelectProps } from 'antd'

export function Select (props: AntSelectProps) {
  const { options = [], children = [], ...restProps } = props
  const isSelectOptGroup = Array.isArray(children) && children?.some(c => c.type.isSelectOptGroup)
  const isGroupOption = options?.some(opt =>
    opt.hasOwnProperty('label') && !opt.hasOwnProperty('value') && Array.isArray(opt?.options)
  )
  const isGroupingDropdown = isSelectOptGroup || isGroupOption
  const extraClassName = [
    ...(props?.dropdownClassName?.split(' ') ?? []),
    isGroupingDropdown ? 'grouping-dropdown' : '',
    props?.mode === 'multiple' ? 'multiple-dropdown' : ''
  ].filter(cls => cls).join(' ')

  const getGroupOptions = () => {
    return isSelectOptGroup
      ? children?.map(({ props }) => ({
        label: <span>{props.label}</span>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options: props?.children?.map(({ props }: any) => ({
          label: props?.children,
          value: props?.value
        }))
      }))
      : options?.map(opt => ({
        label: <span>{opt.label}</span>,
        ...(opt.options ? { options: opt.options } : null),
        ...(opt.value ? { value: opt.value } : null)
      }))
  }

  const selectProps = isGroupingDropdown ? {
    ...restProps,
    showArrow: true,
    options: getGroupOptions()
  } : props

  return <AntSelect
    {...selectProps}
    dropdownClassName={extraClassName}
    menuItemSelectedIcon={<Check />}
  />
}

Select.Option = AntSelect.Option
Select.OptGroup = AntSelect.OptGroup
