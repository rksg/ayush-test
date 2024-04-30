import { useEffect, useState } from 'react'

import { Radio, RadioChangeEvent, Space } from 'antd'
import { useIntl }                        from 'react-intl'

import { Subtitle } from '@acx-ui/components'

import { ApInfo }                             from './contents'
import { ApInfoRadio, ApInfoRadioExtendInfo } from './styledComponents'

export interface ApInfoCradsProps {
  apInfos: ApInfo[],
  selectedApIndex: number,
  onSelectApChanged: (index: number) => void,
  disabled?: boolean
}

export function ApInfoCards (props: ApInfoCradsProps) {
  const { $t } = useIntl()

  const { apInfos, selectedApIndex, onSelectApChanged, disabled = false } = props

  const [ apInfoList, setApInfoList ] = useState<ApInfo[]>([])
  useEffect(() => {
    if (Array.isArray(apInfos)) {
      setApInfoList(apInfos)
    }
  }, [apInfos])

  const onChange = (e: RadioChangeEvent) => {
    onSelectApChanged(e.target.value)
  }

  return (<>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Connecting Access Point' })}
    </Subtitle>
    <Radio.Group onChange={onChange} value={selectedApIndex}>
      <Space direction='vertical' size={'middle'}>
        {
          apInfoList.map((item, index) => {
            const { name, apMac='', model='', ssid, radio } = item

            const radioText = `${model} (${apMac})`
            return (
              <ApInfoRadio key={index} value={index} disabled={disabled}>
                <span>{radioText}</span>


                {(selectedApIndex === index) && <>
                  <ApInfoRadioExtendInfo>
                    <span> {$t({ defaultMessage: 'AP MAC:' })}</span>
                    <span>{apMac}</span>
                  </ApInfoRadioExtendInfo>
                  {name &&
                  <ApInfoRadioExtendInfo>
                    <span>{$t({ defaultMessage: 'AP Name:' })}</span>
                    <span> {name}</span>
                  </ApInfoRadioExtendInfo>
                  }
                  {ssid &&
                  <ApInfoRadioExtendInfo>
                    <span>{$t({ defaultMessage: 'SSID:' })}</span>
                    <span> {ssid}</span>
                  </ApInfoRadioExtendInfo>
                  }
                  {radio &&
                  <ApInfoRadioExtendInfo>
                    <span>{$t({ defaultMessage: 'Radio:' })}</span>
                    <span> {radio}</span>
                  </ApInfoRadioExtendInfo>
                  }
                </>}
              </ApInfoRadio>
            )
          })
        }
      </Space>
    </Radio.Group>
  </>
  )
}