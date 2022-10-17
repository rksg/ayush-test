import { useEffect, useState } from 'react'

import { Checkbox } from 'antd'
import { useIntl }  from 'react-intl'

import { PortalLanguageEnum } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

export default function PortalLanguageSettings (props:{
  isShow: boolean,
  isReset: boolean,
  onClose: () => void,
  updateAlternativeLanguage: (value: { [key: string]: boolean; }) => void
}) {
  const { $t } = useIntl()
  const { Option } = UI.Select
  const { isShow, onClose, updateAlternativeLanguage, isReset } = props
  const [ alternativeLang, setAlternativeLang]=
    useState({} as { [key:string]: boolean })
  const [ displayLang, setDisplayLang]=
    useState('English')
  useEffect(() => {
    if (isReset) {
      setAlternativeLang({})
      setDisplayLang('English')
    }
  }, [isReset])
  return (
    <UI.CommonContainer $isShow={isShow}
      onMouseLeave={onClose}>
      <UI.CommonLabel>{$t({ defaultMessage: 'Display Language' })}</UI.CommonLabel>
      <UI.Select value={isReset ? 'English' : displayLang}
        onChange={(value)=>{
          setDisplayLang(value as string)
          alternativeLang[value as keyof typeof PortalLanguageEnum] = false
          setAlternativeLang({ ...alternativeLang })
          updateAlternativeLanguage(alternativeLang)
        }}>
        {Object.keys(PortalLanguageEnum).map(
          (key => <Option key={key}>{PortalLanguageEnum[key as keyof typeof PortalLanguageEnum]}
          </Option>
          ))}
      </UI.Select>
      <UI.CommonLabel>{$t({ defaultMessage: 'Alternative languages' })}</UI.CommonLabel>
      {Object.keys(PortalLanguageEnum).map((key => <UI.CommonLabel key={key+'label'}>
        <Checkbox key={key+'checkbox'}
          disabled={key === displayLang}
          checked={isReset ? false : key === displayLang ? false: alternativeLang[key]}
          onChange={(e)=>{
            alternativeLang[key] = e.target.checked
            setAlternativeLang({ ...alternativeLang })
            updateAlternativeLanguage({ ...alternativeLang })
          }}>
          {PortalLanguageEnum[key as keyof typeof PortalLanguageEnum]} </Checkbox>
      </UI.CommonLabel>
      ))}
    </UI.CommonContainer>
  )
}
