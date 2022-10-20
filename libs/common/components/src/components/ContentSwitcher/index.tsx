import { FC, ReactNode, useState } from 'react'

import { SelectionControl, SelectionControlOptionProps } from '../SelectionControl'
interface TabDetail {
  label: React.ReactNode
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
  space?: number
}

export const ContentSwitcher: FC<ContentSwitcherProps> = (props) => {
  const { tabDetails, defaultValue, size, align, space } = props

  const options: SelectionControlOptionProps[] = tabDetails.map(tabDetail=>{
    return {
      label: tabDetail.label,
      value: tabDetail.value,
      icon: tabDetail.icon,
      disabled: tabDetail.disabled
    }
  })
  const [activeContent, setActiveContent] = useState(defaultValue || options[0].value)
  return(
    <>
      <div style={{ textAlign: align, padding: `${space}px 0px` }}>
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
  align: 'center',
  space: 10
}
