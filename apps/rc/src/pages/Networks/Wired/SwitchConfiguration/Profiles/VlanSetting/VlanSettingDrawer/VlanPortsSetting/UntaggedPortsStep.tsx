
import { useState, useEffect, SetStateAction } from 'react'

import { Row, Col, Form, Input, Radio, Typography, RadioChangeEvent, Checkbox, Select } from 'antd'
import { CheckboxChangeEvent }                                                          from 'antd/lib/checkbox'

import { Card, StepsForm, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
import { ICX_MODELS_MODULES }       from '@acx-ui/rc/utils'
import { getIntl }                  from '@acx-ui/utils'

import * as UI                  from './styledComponents'
import { VlanSettingInterface } from './VlanPortsModal'

export interface ModelsType {
  label: string,
  value: string
}

export function UntaggedPortsStep (props: { vlanSettings: VlanSettingInterface }) {
  const { $t } = getIntl()
  const { vlanSettings } = props

  console.log(vlanSettings)

  const switchSupportIcx8200FF = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8200)

  useEffect(() => {
    if(ICX_MODELS_MODULES){
      const familiesData = Object.keys(ICX_MODELS_MODULES).filter(key=> {
        return !switchSupportIcx8200FF && key !== 'ICX8200'
      }).map(key => {
        return { label: `ICX-${key.split('ICX')[1]}`, value: key }
      })
    }

  }, [ICX_MODELS_MODULES])


  return (
    <>
      <Row gutter={20}>
        <Col>
          <label style={{ color: 'var(--acx-neutrals-60)' }}>
            {$t({ defaultMessage:
                'Select the untagged ports (access ports) for this model ({family}-{model}):' },
            { family: vlanSettings.family, model: vlanSettings.model })}
          </label>
        </Col>
      </Row>
      <Row gutter={20} style={{ marginTop: '20px' }}>
        <Col>
        </Col>
      </Row>
    </>
  )
}