import { Checkbox } from 'antd'
import { useIntl }  from 'react-intl'

import { Demo, PortalLanguageEnum } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

export default function PortalLanguageSettings (props:{
  demoValue: Demo,
  onClose: () => void,
  updateViewContent:(value:Demo)=>void,
}) {
  const { $t } = useIntl()
  const { Option } = UI.Select
  const { onClose, updateViewContent, demoValue } = props
  return (
    <div
      onMouseLeave={onClose}>
      <UI.CommonLabel>{$t({ defaultMessage: 'Display Language' })}</UI.CommonLabel>
      <UI.Select value={demoValue.displayLang}
        onChange={(value)=>{
          demoValue.displayLang = value as string
          demoValue.alternativeLang[value as keyof typeof PortalLanguageEnum] = false
          updateViewContent({ ...demoValue })
        }}>
        {Object.keys(PortalLanguageEnum).map(
          (key => <Option key={key}>{PortalLanguageEnum[key as keyof typeof PortalLanguageEnum]}
          </Option>
          ))}
      </UI.Select>
      <UI.CommonLabel>{$t({ defaultMessage: 'Alternative languages' })}</UI.CommonLabel>
      {Object.keys(PortalLanguageEnum).map((key => <UI.CommonLabel key={key+'label'}>
        <Checkbox key={key+'checkbox'}
          disabled={key === demoValue.displayLang}
          checked={key === demoValue.displayLang ? false:
            demoValue.alternativeLang[key]}
          onChange={(e)=>{
            demoValue.alternativeLang[key] = e.target.checked
            updateViewContent({ ...demoValue })
          }}>
          {PortalLanguageEnum[key as keyof typeof PortalLanguageEnum]} </Checkbox>
      </UI.CommonLabel>
      ))}
    </div>
  )
}
