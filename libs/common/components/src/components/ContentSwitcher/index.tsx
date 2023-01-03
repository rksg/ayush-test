import { FC, ReactNode, useState } from 'react'

import { RadioChangeEvent } from 'antd'

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
  value?: string
  onChange?: (value: string) => void
}

const sizeSpaceMap = {
  small: '8px',
  large: '15px'
}

export const ContentSwitcher: FC<ContentSwitcherProps> = (props) => {
  const { tabDetails, defaultValue, size, align, value, onChange } = props

  const options: SelectionControlOptionProps[] = tabDetails.map(tabDetail=>{
    return {
      label: tabDetail.label,
      value: tabDetail.value,
      icon: tabDetail.icon,
      disabled: tabDetail.disabled
    }
  })
  const [activeContent, setActiveContent] = useState(defaultValue || options[0].value)

  const handleChange = (e: RadioChangeEvent) => {
    if(onChange) {
      onChange(e.target.value)
    }
    setActiveContent(e.target.value)
  }

  return(
    <>
      <div style={{ textAlign: align, padding: `${sizeSpaceMap[size!]} 0px` }}>
        <SelectionControl options={options}
          defaultValue={defaultValue || options[0].value}
          size={size}
          value={value || activeContent}
          onChange={handleChange} />
      </div>
      {
        tabDetails.find((tabDetail) => tabDetail.value === (value || activeContent))?.children
      }
    </>
  )
}

ContentSwitcher.defaultProps = {
  size: 'small',
  align: 'center'
}
