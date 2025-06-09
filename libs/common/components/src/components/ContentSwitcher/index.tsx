import { FC, ReactNode, useState } from 'react'

import { RadioChangeEvent } from 'antd'

import { SelectionControl, SelectionControlOptionProps } from '../SelectionControl'
interface TabDetail {
  label: ReactNode
  value: string
  children: ReactNode
  icon?: ReactNode
  disabled?: boolean
  tooltip?: string
}

export interface ContentSwitcherProps {
  tabId?: string
  defaultValue?: string
  formInitValue?: string
  tabDetails: Array<TabDetail>
  size?: 'small' | 'large'
  align?: 'left' | 'right' | 'center'
  extra?: React.ReactNode;
  value?: string
  onChange?: (value: string) => void
  noPadding?: boolean
  tabPersistence?: boolean
}

const sizeSpaceMap = {
  small: '8px',
  large: '15px'
}

export const ContentSwitcher: FC<ContentSwitcherProps> = (props) => {
  const { tabId, tabDetails, defaultValue, formInitValue, size, align, value, onChange,
    extra, noPadding, tabPersistence } = props

  const initValue = defaultValue || formInitValue
  const options: SelectionControlOptionProps[] = tabDetails.map(tabDetail=>{
    return {
      label: tabDetail.label,
      value: tabDetail.value,
      icon: tabDetail.icon,
      disabled: tabDetail.disabled,
      tooltip: tabDetail.tooltip
    }
  })
  const isDefaultOptionVisible = options.find(o => o.value === initValue)
  const defaultActiveContent = isDefaultOptionVisible ? initValue : options[0].value
  const storedTab = localStorage.getItem(`${tabId}-content-switcher`) as string
    || defaultActiveContent
  const [activeContent, setActiveContent] = useState(tabPersistence ?
    storedTab : defaultActiveContent)
  const padding = size === 'small'
    ? `${sizeSpaceMap[size!]} 0 calc(${sizeSpaceMap[size!]} * 2)`
    : `${sizeSpaceMap[size!]} 0`

  const handleChange = (e: RadioChangeEvent) => {
    if(onChange) {
      onChange(e.target.value)
    }
    setActiveContent(e.target.value)
    if(tabId) {
      localStorage.setItem(`${tabId}-content-switcher`, e.target.value)
    }
  }
  return (
    <>
      <div style={{ textAlign: align, padding }}>
        <SelectionControl options={options}
          defaultValue={initValue || options[0].value}
          size={size}
          value={value || activeContent}
          onChange={handleChange}
          extra={extra}
          noPadding={noPadding}
        />
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
