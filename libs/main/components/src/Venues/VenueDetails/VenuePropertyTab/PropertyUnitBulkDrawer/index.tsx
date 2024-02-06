import { useEffect, useState } from 'react'

import { Form, Space, Typography, Checkbox } from 'antd'
import { useWatch }                          from 'antd/lib/form/Form'
import moment                                from 'moment-timezone'
import { useIntl }                           from 'react-intl'
import styled                                from 'styled-components'

import {
  Button,
  Drawer
} from '@acx-ui/components'
import {
  useGetConnectionMeteringListQuery,
  useBulkUpdateUnitProfileMutation
} from '@acx-ui/rc/services'
import {
  ConnectionMetering,
  PropertyUnit
} from '@acx-ui/rc/utils'

import { ConnectionMeteringSettingForm } from '../ConnectionMeteringSettingForm'

export interface PropertyUnitBulkDrawerProps {
  visible: boolean,
  onClose: () => void,
  venueId: string,
  data: PropertyUnit[]
}

interface FormFields {
  meteringProfileId?: string | null
  expirationDate?: moment.Moment
}

const Info = styled(Typography.Text)`
  overflow-wrap: anywhere;
  font-size: 12px;
`
function EnableSettingsCheckbox (props: {
  onChange: (v:boolean)=>void
}) {
  const { onChange } = props
  const { $t } = useIntl()
  const [checked, setChecked] = useState(false)
  useEffect(()=>{onChange(checked)}, [checked])
  return(
    <div style={{ display: 'flex', marginBottom: '4px' }}>
      <div style={{ display: 'flex' }}>
        <Checkbox checked={checked}
          onChange={(e)=>setChecked(e.target.checked)}/>
      </div>
      {!checked && <div
        style={{ display: 'flex', marginLeft: '4px', fontSize: '12px', marginTop: '2px' }}>
        {$t({ defaultMessage: 'Multiple values' })}
      </div>
      }
    </div>)
}

export function PropertyUnitBulkDrawer (props: PropertyUnitBulkDrawerProps) {
  const [form] = Form.useForm<FormFields>()
  const { visible, data, venueId, onClose } = props
  const { $t } = useIntl()
  const profileId = useWatch('meteringProfileId', form)
  const expirationDate = useWatch('expirationDate', form)

  const [hasMultipleValues, setHasMultipleValues] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [appliable, setAppliable] = useState(false)
  const [connectionMeteringList, setConnectionMeteringList] = useState<ConnectionMetering[]>([])
  const connectionMeteringListQuery = useGetConnectionMeteringListQuery(
    { payload: { pageSize: '2147483647', page: '1' } }
  )

  const [updateProfileMutation] = useBulkUpdateUnitProfileMutation()
  const handleUpdateUnitProfile = async () => {
    const { meteringProfileId, expirationDate } = form.getFieldsValue()
    const expirationDateString = expirationDate?.startOf('day').toISOString()
    try {
      await updateProfileMutation({
        params: { venueId: venueId, profileId: meteringProfileId!! },
        payload: { unitIds: data.map(u => u.id), profileExpiry: expirationDateString } }).unwrap()
    } catch(e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
    onClose()
  }


  useEffect(()=>{
    if (!connectionMeteringListQuery.isLoading && connectionMeteringListQuery?.data) {
      setConnectionMeteringList(connectionMeteringListQuery?.data.data)
    }
  }, [connectionMeteringListQuery.data, connectionMeteringListQuery.isLoading])

  useEffect(()=>{
    if (formVisible && profileId && expirationDate) {
      setAppliable(true)
    } else {
      setAppliable(false)
    }
  }, [formVisible, profileId, expirationDate])

  useEffect(()=> {
    if (data.length === 0)
      return
    let first = data.at(0)
    let multipleValues = false
    for (let i = 1; i < data.length; i ++) {
      if (first?.trafficControl?.meteringProfileId !== data.at(i)?.trafficControl?.meteringProfileId
       || first?.trafficControl?.profileExpiry !== data.at(i)?.trafficControl?.profileExpiry) {
        multipleValues = true
        break
      }
    }
    form.setFieldValue('meteringProfileId', first?.trafficControl?.meteringProfileId)
    form.setFieldValue('expirationDate', first?.trafficControl?.profileExpiry ?
      moment(first.trafficControl.profileExpiry) : undefined)
    setHasMultipleValues(multipleValues)
  }, [data])

  useEffect(()=> {
    if (!hasMultipleValues) {
      setFormVisible(true)
    } else if (hasMultipleValues && enabled) {
      setFormVisible(true)
    } else {
      setFormVisible(false)
    }
  }, [hasMultipleValues, enabled])


  const footer = [
    <Space style={{ display: 'flex', marginLeft: 'auto' }} key='form-footer'>
      <Button key='cancel' onClick={onClose}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
      <Button
        key='apply'
        type='primary'
        disabled={!appliable}
        onClick={handleUpdateUnitProfile}
      >
        {$t({ defaultMessage: 'Apply' })}
      </Button>
    </Space>
  ]

  return <Drawer
    title='Edit Units'
    visible={visible}
    footer={footer}
    onClose={onClose}
  >
    <Form
      name='PropertyUnitBulkForm'
      form={form}
      scrollToFirstError
      layout='vertical'
    >
      <Form.Item
        label={$t({ defaultMessage: 'Selected Units' })}
      >
        {<Info> {data.map(unit => unit.name).reduce((prev, curr) => prev + ', ' + curr)}</Info>}
      </Form.Item>
      {hasMultipleValues && <EnableSettingsCheckbox onChange={(v)=>setEnabled(v)}/>}
      {formVisible && <ConnectionMeteringSettingForm data={connectionMeteringList} isEdit={true}/>}
    </Form>
  </Drawer>
}