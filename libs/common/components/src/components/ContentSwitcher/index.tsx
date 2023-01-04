import { FC, ReactNode, useState } from 'react'

import { SelectionControl, SelectionControlOptionProps } from '../SelectionControl'
interface TabDetail {
  label: ReactNode
  value: string
  children: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

export interface ContentSwitcherProps {
  defaultValue?: string
  tabDetails: Array<TabDetail>
  size?: 'small' | 'large'
  align?: 'left' | 'right' | 'center'
}

const sizeSpaceMap = {
  small: '8px',
  large: '15px'
}

export const ContentSwitcher: FC<ContentSwitcherProps> = (props) => {
  const { tabDetails, defaultValue, size, align } = props

  const options: SelectionControlOptionProps[] = tabDetails.map(tabDetail=>{
    return {
      label: tabDetail.label,
      value: tabDetail.value,
      icon: tabDetail.icon,
      disabled: tabDetail.disabled
    }
  })
  const [activeContent, setActiveContent] = useState(defaultValue || options[0].value)
  const padding = size === 'small'
    ? `${sizeSpaceMap[size!]} 0 calc(${sizeSpaceMap[size!]} * 2)`
    : `${sizeSpaceMap[size!]} 0`
  return (
    <>
      <div style={{ textAlign: align, padding }}>
        <SelectionControl options={options}
          defaultValue={defaultValue || options[0].value}
          size={size}
          onChange={(e) => {
            setActiveContent(e.target.value)
          }} />
      </div>
      {
        tabDetails.find((tabDetail) => tabDetail.value === activeContent)?.children
      }
    </>
  )
}

ContentSwitcher.defaultProps = {
  size: 'small',
  align: 'center'
}
