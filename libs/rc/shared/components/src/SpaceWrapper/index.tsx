import React from 'react'

import { Space } from 'antd'
import styled    from 'styled-components/macro'

import type { SpaceProps } from 'antd'

interface SpaceWrapperProps extends SpaceProps {
    ref?: React.ForwardedRef<HTMLDivElement>;
    children: React.ReactNode;
    justifycontent?: 'flex-start' | 'flex-end'
    | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    full?: boolean;
    fullWidth?: boolean;
    fullHeight?: boolean;
}


export const StyledSpace = React.forwardRef((
  { full, fullWidth, fullHeight, ...props }: SpaceWrapperProps, ref) => {
  return (
    <Space
      ref={ref as React.MutableRefObject<HTMLDivElement>}
      {...props}
    >
      {props.children}
    </Space>
  )
})

export const SpaceWrapper = styled(StyledSpace)<SpaceWrapperProps>`
    width: ${(props) => (props.full || props.fullWidth) ? '100%' : 'auto'};
    height: ${(props) => (props.full || props.fullHeight) ? '100%' : 'auto'};
    justify-content: ${(props) => props.justifycontent || 'center'};
`