import { Select as AntSelect } from 'antd'
import { useIntl }             from 'react-intl'

import { Check } from '@acx-ui/icons'

import type { SelectProps as AntSelectProps } from 'antd'

export interface SelectProps extends AntSelectProps {
  type?: string
}

export function Select (props: SelectProps) {
  const { options = [], children = [], ...restProps } = props
  const { $t } = useIntl()
  const isSelectOptGroup = Array.isArray(children) && children?.some(c => c?.type?.isSelectOptGroup)
  const isGroupOption = options?.some(opt =>
    opt.hasOwnProperty('label') && !opt.hasOwnProperty('value') && Array.isArray(opt?.options)
  )
  const isGroupingDropdown = isSelectOptGroup || isGroupOption
  const extraClassName = [
    ...(props?.dropdownClassName?.split(' ') ?? []),
    isGroupingDropdown ? 'grouping-dropdown' : '',
    props?.mode === 'multiple' ? 'multiple-dropdown' : '',
    props?.type === 'radio' && !props?.mode ? 'radio-type' : ''
  ].filter(cls => cls).join(' ')

  const getGroupOptions = () => {
    return isSelectOptGroup
      ? children?.map(({ props }) => ({
        title: props?.label,
        label: <span>{props?.label}</span>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options: props?.children?.map(({ props }: any) => ({
          label: props?.children,
          value: props?.value,
          key: props?.label,
          disabled: props?.disabled
        }))
      }))
      : options?.map(opt => ({
        title: opt?.label,
        label: <span>{opt?.label}</span>,
        ...(opt.options ? { options: opt.options } : null),
        ...(opt.value ? { value: opt.value } : null)
      }))
  }

  const selectProps = isGroupingDropdown ? {
    showArrow: true,
    ...restProps,
    options: getGroupOptions()
  } : props

  return <AntSelect
    placeholder={$t({ defaultMessage: 'Select...' })}
    {...selectProps}
    {...(props?.mode === 'multiple' && { menuItemSelectedIcon: <Check /> })}
    dropdownClassName={extraClassName}
  />
}

Select.Option = AntSelect.Option
Select.OptGroup = AntSelect.OptGroup
Select.getPopupContainer = (triggerNode: HTMLElement | undefined) => {
  if (triggerNode?.closest('.ant-select-selector')) {
    return triggerNode.parentElement ?? document.body
  }
  return document.body
}