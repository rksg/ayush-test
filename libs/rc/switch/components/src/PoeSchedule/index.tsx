import { useEffect, useState } from 'react'

import { Button, Col, Form, FormInstance, Radio, RadioChangeEvent, Row, Space } from 'antd'
import { useWatch }                                                             from 'antd/lib/form/Form'
import { useIntl }                                                              from 'react-intl'

import {
  Modal,
  ScheduleCard
} from '@acx-ui/components'
import { useIsSplitOn, Features }                        from '@acx-ui/feature-toggle'
import { useLazyGetTimezoneQuery, useLazyGetVenueQuery } from '@acx-ui/rc/services'
import { SchedulerTypeEnum }                             from '@acx-ui/rc/utils'
import { useParams }                                     from '@acx-ui/react-router-dom'
import { Scheduler }                                     from '@acx-ui/types'

import * as UI from './styledComponents'

interface ScheduleWeeklyProps {
  form: FormInstance
  visible: boolean
  setVisible: (visible: boolean) => void
  venueId?: string
}

interface ScheduleVenue {
  name: string
  latitude: string
  longitude: string
}

export const parseExcludedHours = (hours?:Scheduler):Record<string, number[]> | undefined => {
  if (hours) {
    const result: Record<string, number[]> = {}
    Object.keys(hours).forEach(hour => {
      result[hour] = hours[hour].map(h => parseInt(h, 10))
    })
    return result
  }
  return hours
}

export const buildExcludedHours = (hours?:Record<string, number[]>):Scheduler | undefined => {
  if (hours) {
    const result: Scheduler = {}
    Object.keys(hours).forEach(hour => {
      result[hour] = hours[hour].map(h => `${h}`)
    })
    return result
  }
  return hours
}

export const PoeSchedule = (props:ScheduleWeeklyProps) => {
  const { visible, setVisible, form, venueId } = props
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [hidden, setHidden] = useState<boolean>(true)
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  const [getTimezone] = useLazyGetTimezoneQuery()
  const [getVenue] = useLazyGetVenueQuery()
  const [venueData, setVenueData] = useState<ScheduleVenue>()
  const [schedule, setSchedule] = useState<Scheduler | undefined>(undefined)

  const poeScheduler = useWatch('poeScheduler', form)

  useEffect(() => {
    if(poeScheduler?.type === SchedulerTypeEnum.CUSTOM){
      setHidden(false)
      setSchedule(poeScheduler)
      form.setFieldValue('poeSchedulerType', SchedulerTypeEnum.CUSTOM)
    }

    const fetchVenueData = async () => {
      const result = await getVenue({ params: { tenantId, venueId } })
      if(result.data && result.data.address.latitude && result.data.address.longitude){
        setVenueData({
          name: result.data.name,
          latitude: result.data.address.latitude.toString(),
          longitude: result.data.address.longitude.toString()
        })
      }
    }
    fetchVenueData()
  }, [getVenue, tenantId, venueId, poeScheduler])

  const onTypeChange = (e: RadioChangeEvent) => {
    if(e.target.value === SchedulerTypeEnum.NO_SCHEDULE){
      setHidden(true)
    }else{
      setHidden(false)
    }
  }

  interface ScheduleData {
    [day: string]: string[];
  }

  interface TransformedScheduleData {
    [day: string]: string;
  }

  function transformScheduleData (data: ScheduleData): TransformedScheduleData {
    const transformedData: TransformedScheduleData = {}

    Object.keys(data).forEach((day) => {
      transformedData[day] = ''
      for (let i = 0; i < 24; i++) {
        transformedData[day] += data[day].includes(i.toString()) ? '1' : '0'
      }
    })

    return transformedData
  }

  const onApply = () => {
    const { scheduler, poeSchedulerType } = form.getFieldsValue()
    const { type, ...weekDays } = scheduler || {}

    if (poeSchedulerType === SchedulerTypeEnum.NO_SCHEDULE) {
      form.setFieldsValue({
        ...form.getFieldsValue(),
        poeScheduler: { type: SchedulerTypeEnum.NO_SCHEDULE }
      })
    } else if (poeSchedulerType === SchedulerTypeEnum.CUSTOM) {
      form.setFieldsValue({
        ...form.getFieldsValue(),
        poeScheduler: { type: SchedulerTypeEnum.CUSTOM, ...transformScheduleData(weekDays) } })
    }
    setVisible(false)
  }

  const onClose = () => {
    form.resetFields()
    setVisible(false)
  }

  const footer = (
    <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button key='cancelBtn' onClick={onClose}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
      <Button
        data-testid='addButton'
        key='okBtn'
        type='primary'
        onClick={onApply}
      >
        {$t({ defaultMessage: 'Apply' })}
      </Button>
    </Space>
  )

  return (
    <Modal
      title={$t({ defaultMessage: 'PoE Schedule ' })}
      visible={visible}
      width={800}
      footer={footer}
      maskClosable={true}
      destroyOnClose={true}
      keyboard={false}
      closable={true}
      onCancel={onClose}
    ><Form
        form={form}
        layout='horizontal'
        size='small'
      >
        <UI.ScheduleWrapper>
          <Row gutter={10} key={'row1'}>
            <Col span={8} key={'col1'}>
              <div style={{ marginTop: '1em' }}>
                <Form.Item
                  name={'poeSchedulerType'}
                  initialValue={SchedulerTypeEnum.NO_SCHEDULE}
                >
                  <Radio.Group onChange={onTypeChange}>
                    <Radio value={SchedulerTypeEnum.NO_SCHEDULE}>
                      {$t({ defaultMessage: 'No Schedule' })}
                    </Radio>

                    <Radio value={'CUSTOM'} style={{ marginTop: '1em' }}>
                      {$t({ defaultMessage: 'Custom Schedule' })}
                    </Radio>
                  </Radio.Group>
                </Form.Item>
              </div>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} key={'col1'}>
              {!hidden && <ScheduleCard
                type={'CUSTOM'}
                scheduler={schedule}
                lazyQuery={isMapEnabled ? getTimezone : undefined}
                form={form}
                fieldNamePath={['scheduler']}
                intervalUnit={60}
                title={$t({ defaultMessage: 'Mark/ unmark areas to change PoE availability' })}
                disabled={false}
                loading={false}
                isShowTips={true}
                prefix={false}
                timelineLabelTop={false}
                isShowTimezone={true}
                venue={venueData}
              />
              }
            </Col>
          </Row>
        </UI.ScheduleWrapper>
      </Form>
    </Modal>
  )
}