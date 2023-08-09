import React, { useEffect } from 'react'

import styled from 'styled-components/macro'

import { BaseCascader, BaseCascaderProps } from '../Cascader/BaseCascader'

import {
  cascaderStyles,
  DropdownPortal
} from './styledComponents'

export const FlattenCascader = styled(function FlattenCascader (
  { disabled, ...props }: BaseCascaderProps
) {
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
    <BaseCascader
      {...props}
      open={open}
      disabled={realDisabled}
      getPopupContainer={() => ref.current!}
      dropdownClassName={props.className}
      expandTrigger='click'
      animation='none'
    />
    <DropdownPortal ref={ref} />
  </>
})`${cascaderStyles}`
