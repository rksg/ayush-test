import React, { useEffect } from 'react'

import { Cascader } from 'antd'
import styled       from 'styled-components/macro'

import {
  cascaderStyles,
  DropdownPortal,
  ExpandIcon
} from './styledComponents'

import type {
  BaseOptionType,
  DefaultOptionType,
  CascaderProps
} from 'antd/lib/cascader'

export const FlattenCascader = styled(function FlattenCascader <
  OptionType extends DefaultOptionType | BaseOptionType = DefaultOptionType
> ({ disabled, ...props }: CascaderProps<OptionType>) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [realDisabled, setDisabled] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  useEffect(() => setOpen(true), [])

  // delay set of disabled so menu could be open before it gets disabled
  useEffect(() => {
    if (!open) return
    setDisabled(disabled ?? false)
  }, [disabled, open])

  return <>
    <Cascader
      {...props}
      open={open}
      disabled={realDisabled}
      getPopupContainer={() => ref.current!}
      dropdownClassName={props.className}
      suffixIcon={null}
      expandIcon={<ExpandIcon />}
      animation='none'
    />
    <DropdownPortal ref={ref} />
  </>
})`${cascaderStyles}`
