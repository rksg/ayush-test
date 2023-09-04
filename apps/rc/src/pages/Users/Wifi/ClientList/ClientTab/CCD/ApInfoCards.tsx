import { Fragment, useEffect, useState } from 'react'

import { Radio, RadioChangeEvent, Space } from 'antd'
import { useIntl }                        from 'react-intl'

import { Subtitle } from '@acx-ui/components'

import { ApInfo }                                          from './contents'
import { ApInfoRadioExtendInfo, WarningTriangleSolidIcon } from './styledComponents'




export interface ApInfoCradsProps {
  apInfos: ApInfo[],
  selectedApMac: string,
  setSelectedApMac: (apMac: string) => void
  ccdApMac?: string
}

export function ApInfoCards (props: ApInfoCradsProps) {
  const { $t } = useIntl()

  const { apInfos, selectedApMac, setSelectedApMac, ccdApMac } = props

  const [ apInfoList, setApInfoList ] = useState<ApInfo[]>([])
  //const [ selectedAp, setSelectedAp ] = useState<string>()

  useEffect(() => {
    if (Array.isArray(apInfos)) {
      setApInfoList(apInfos)
    }
  }, [apInfos])

  /*
  useEffect(() => {
    if (selectedApMac !== undefined) {
      setSelectedAp(selectedApMac.toUpperCase())
    }

  }, [selectedApMac])
  */

  const onChange = (e: RadioChangeEvent) => {
    //console.log('radio checked', e.target.value)

    setSelectedApMac(e.target.value)
  }

  return (<>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Connecting Access Point' })}
    </Subtitle>
    <Radio.Group onChange={onChange} value={selectedApMac}>
      <Space direction='vertical' size={'middle'}>
        {
          apInfoList.map(item => {
            const { name, apMac='', model='', ssid, radio } = item

            const radioText = `${model} (${apMac})`
            return (
              <Radio key={apMac} value={apMac}>
                <Space>
                  <span>{radioText}</span>
                  {(ccdApMac === apMac) &&
                   <WarningTriangleSolidIcon />
                  }
                </Space>
                {(selectedApMac === apMac) && <>
                  <ApInfoRadioExtendInfo>
                    <span> {$t({ defaultMessage: 'AP MAC:' })}</span>
                    <span>{apMac}</span>
                  </ApInfoRadioExtendInfo>
                  <ApInfoRadioExtendInfo>
                    <span>{$t({ defaultMessage: 'AP Name:' })}</span>
                    <span> {name}</span>
                  </ApInfoRadioExtendInfo>
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
              </Radio>
            )
          })
        }
      </Space>
    </Radio.Group>
  </>
  )
}