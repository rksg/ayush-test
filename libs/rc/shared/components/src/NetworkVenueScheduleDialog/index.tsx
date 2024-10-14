/* eslint-disable max-len */
import { useEffect, useState, useRef } from 'react'

import {
  ModalProps as AntdModalProps,
  Col,
  Form,
  Row,
  Radio,
  RadioChangeEvent
} from 'antd'
import { useIntl } from 'react-intl'

import {
  Modal,
  ScheduleCard,
  parseNetworkVenueScheduler,
  showActionModal
} from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import { useLazyGetTimezoneQuery } from '@acx-ui/rc/services'
import {
  NetworkVenue,
  NetworkSaveData,
  SchedulerTypeEnum } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

interface SchedulingModalProps extends AntdModalProps {
  networkVenue?: NetworkVenue
  venue?: {
    latitude: string,
    longitude: string,
    name: string
  }
  network?: { name: string } | null | NetworkSaveData
  formName: string
}

export function NetworkVenueScheduleDialog (props: SchedulingModalProps) {
  const { networkVenue, venue, network, formName } = props
  const type = networkVenue?.scheduler?.type ? networkVenue.scheduler.type.valueOf() : SchedulerTypeEnum.ALWAYS_ON
  const scheduler = networkVenue ? parseNetworkVenueScheduler({ ...networkVenue.scheduler }) : undefined
  const open = !!props.visible
  const { $t } = useIntl()
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  const [form] = Form.useForm()
  const [getTimezone] = useLazyGetTimezoneQuery()
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState<boolean>(true)

  // reset form fields when modal is closed
  const prevOpenRef = useRef(false)
  const prevOpen = prevOpenRef.current
  useEffect(() => {
    prevOpenRef.current = open
  }, [open])

  useEffect(() => {
    if (!open && prevOpen) {
      setLoading(false)
      form.resetFields()
    }
  }, [form, prevOpen, open])

  useEffect(() => {
    const scheduler = networkVenue?.scheduler
    const type = scheduler?.type ?? SchedulerTypeEnum.ALWAYS_ON
    setDisabled(type !== SchedulerTypeEnum.CUSTOM)
    form.setFieldValue(['scheduler', 'type'], type)
  }, [form, networkVenue, networkVenue?.scheduler])

  const showAlwaysOnConfirmDialog = () => {
    const title = $t({ defaultMessage: 'Network Scheduling' })
    const message = $t({ defaultMessage: 'All time slots are marked as available - network will be configured with 24/7 availability' })

    showActionModal({
      type: 'confirm',
      title: title,
      content: message,
      onOk: () => {
        form.setFieldValue('scheduler', { type: SchedulerTypeEnum.ALWAYS_ON })
        form.submit()
      },
      onCancel: () => {
        setLoading(false)
      }
    })
  }
  const showAlwaysOffConfirmDialog = () => {
    const title = $t({ defaultMessage: 'Network Scheduling' })
    const message = $t({ defaultMessage: 'Network is configured to be unavailable at all times. Do you want to continue?' })

    showActionModal({
      type: 'confirm',
      title: title,
      content: message,
      onOk: () => {
        form.setFieldValue('scheduler', { type: SchedulerTypeEnum.ALWAYS_OFF })
        form.submit()
      },
      onCancel: () => (
        setLoading(false)
      )
    })
  }

  const checkScheduleData = (weekDaysSlots: string[]) => {
    const selectAllDays = weekDaysSlots.filter( v => v.length === 96)
    const unSelectAllDays = weekDaysSlots.filter( v => v.length === 0)

    if (selectAllDays.length === 7) {
      showAlwaysOnConfirmDialog()
    } else if (unSelectAllDays.length === 7) {
      showAlwaysOffConfirmDialog()
    } else {
      form.submit()
    }
  }

  const onOk = () => {
    setLoading(true)
    const { scheduler } = form.getFieldsValue()
    const { type, ...weekDays } = scheduler || {}

    if (type === SchedulerTypeEnum.ALWAYS_ON) {
      form.submit()
    } else if (type === SchedulerTypeEnum.CUSTOM) {
      const weekDaysSlots: string[] = Object.values(weekDays)
      checkScheduleData(weekDaysSlots)
    }
  }

  const onTypeChange = (e: RadioChangeEvent) => {
    if(e.target.value === SchedulerTypeEnum.ALWAYS_ON){
      setDisabled(true)
    }else{
      setDisabled(false)
    }
  }

  return (
    <Modal
      {...props}
      title={$t({ defaultMessage: 'Schedule for Network "{NetworkName}" in <VenueSingular></VenueSingular> "{VenueName}"' }, { NetworkName: network?.name, VenueName: venue?.name })}
      okText={$t({ defaultMessage: 'Apply' })}
      maskClosable={true}
      destroyOnClose={true}
      keyboard={false}
      closable={true}
      width={1280}
      onOk={onOk}
      okButtonProps={{ disabled: loading }}
      cancelButtonProps={{ disabled: loading }}
    >
      <Form
        form={form}
        layout='horizontal'
        size='small'
        name={formName}
      >
        <div className='non-selectable-area'>
          <Row gutter={24} key={'row1'}>
            <Col span={4} key={'col1'}>
              <UI.TitleSpan>{$t({ defaultMessage: 'Network availability' })}</UI.TitleSpan>
              <div style={{ marginTop: '1em' }}>
                <Form.Item
                  name={['scheduler', 'type']}
                  initialValue={'ALWAYS_ON'}
                >
                  <Radio.Group onChange={onTypeChange}>
                    <Radio value={'ALWAYS_ON'}>
                      {$t({ defaultMessage: '24/7' })}
                    </Radio>

                    <Radio value={'CUSTOM'} style={{ marginTop: '1em' }}>
                      {$t({ defaultMessage: 'Custom Schedule' })}
                    </Radio>
                  </Radio.Group>
                </Form.Item>
              </div>
            </Col>
          </Row>
          <ScheduleCard
            type={type}
            scheduler={scheduler}
            venue={venue}
            lazyQuery={isMapEnabled? getTimezone: undefined}
            form={form}
            fieldNamePath={['scheduler']}
            disabled={disabled}
            loading={loading}
            intervalUnit={15}
            title={$t({ defaultMessage: 'Mark/ unmark areas to change network availability' })}
          />
        </div>
      </Form>
    </Modal>
  )
}
