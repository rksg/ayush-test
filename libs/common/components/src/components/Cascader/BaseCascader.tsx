import { ReactNode, useMemo } from 'react'

import { CascaderProps as AntCascaderProps } from 'antd'
import { DefaultOptionType }                 from 'antd/es/cascader'
import { CascaderProps as RcCascaderProps }  from 'rc-cascader/lib/Cascader'
import Highlighter                           from 'react-highlight-words'

import * as UI from './styledComponents'

export interface CascaderOption extends DefaultOptionType {
  children?: CascaderOption[]
  displayLabel?: string
  extraLabel?: ReactNode
  ignoreSelection?: boolean
}

export type BaseCascaderProps = {
  menuMaxWidth?: string
  labelMaxWidth?: string
} & RcCascaderProps<CascaderOption> & AntCascaderProps<CascaderOption>

function wrapLabels (
  options: CascaderOption[] | undefined,
  multiple: boolean
): CascaderOption[] | undefined {
  return options?.map((option) => {
    const { label, extraLabel, children } = option
    const displayLabel = option.displayLabel ??
      (typeof label === 'string' ? label : undefined)
    const wrappedLabel = <UI.LabelContainer title={displayLabel}>
      <UI.Label>{label}</UI.Label>
      {extraLabel}
    </UI.LabelContainer>
    return {
      ...option,
      label: wrappedLabel,
      displayLabel,
      children: children && wrapLabels(children, multiple)
    }
  })
}

const showSearch: RcCascaderProps<CascaderOption>['showSearch'] = {
  filter: (input: string, options: CascaderOption[]): boolean => {
    const option = options.slice(-1)[0]
    const str = option?.displayLabel || ''
    return option.ignoreSelection
      ? false
      : str.toLowerCase().includes(input.toLowerCase())
  },
  render: (input: string, options: CascaderOption[]) => {
    const items = options.map((val) => (val?.displayLabel))
    const extraLabels = options.map(item => item?.extraLabel as unknown as ReactNode)
    const extraLabel = extraLabels[extraLabels.length - 1] ?? null
    const text = items.join(' / ')
    return <UI.LabelContainer title={text}>
      <UI.Label overrideMaxWidth={items.length > 1}>
        <Highlighter
          highlightStyle={{ fontWeight: 'bold', background: 'none', padding: 0, color: 'inherit' }}
          searchWords={[input]}
          textToHighlight={text}
          autoEscape
        />
      </UI.Label>
      {extraLabel}
    </UI.LabelContainer>
  }
}

export const displayRender: RcCascaderProps<CascaderOption>['displayRender'] =
  (_, selectedOptions) => selectedOptions?.map((option) => option?.displayLabel).join(' / ')

export function BaseCascader (
  { options, menuMaxWidth, labelMaxWidth, ...props }: BaseCascaderProps
) {
  const wrappedOptions = useMemo(
    () => wrapLabels(options, !!props.multiple),
    [options, props.multiple]
  )
  return <>
    <UI.GlobalStyle
      menuMaxWidth={menuMaxWidth}
      labelMaxWidth={labelMaxWidth}
    />
    <UI.Cascader
      {...props}
      options={!props.loadData ? wrappedOptions : options}
      showSearch={!props.loadData ? showSearch : undefined}
      displayRender={!props.multiple ? displayRender : undefined}
      changeOnSelect
    />
  </>
}
