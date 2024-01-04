import { Form }                       from 'antd'
import { isEmpty }                    from 'lodash'
import { MessageDescriptor, useIntl } from 'react-intl'
import { useParams }                  from 'react-router-dom'

import { Drawer, showToast }                                                                           from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                      from '@acx-ui/feature-toggle'
import { useAddExportSchedulesMutation, useGetExportSchedulesQuery, useUpdateExportSchedulesMutation } from '@acx-ui/rc/services'
import { EventScheduleFrequency }                                                                      from '@acx-ui/rc/utils'

import { eventTypeMapping }   from '../mapping'
import { ScheduleExportForm } from '../ScheduleExportForm'

export interface ScheduleExportDrawerProps {
  title: MessageDescriptor
  visible: boolean
  onClose: () => void
  onSubmit: () => void
  onBackClick?: () => void
}

export const ScheduleExportDrawer = (props: ScheduleExportDrawerProps) => {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { onClose, onSubmit, visible } = props
  const { tenantId } = useParams()

  const iExportEventsOn = useIsSplitOn(Features.EXPORT_EVENTS_TOGGLE)

  const { data: scheduleExportData, isFetching: fetchingEditData } =
  useGetExportSchedulesQuery({ params: { tenantId } }, { skip: !iExportEventsOn })
  const [addExportSchedules] = useAddExportSchedulesMutation()
  const [updateExportSchedules] = useUpdateExportSchedulesMutation()

  const onSave = async () => {
    try {
      const valid = await form.validateFields()
      if (valid) {
        const formData = form.getFieldsValue()
        const saveData = {
          type: 'Event',
          clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          sortOrder: 'DESC',
          sortField: 'event_datetime',
          context: {
            ...formData?.context,
            searchString: [formData?.context?.searchString || ''],
            event_entity_type_all: Object.entries(eventTypeMapping).map(([key]) => key)
          },
          enable: !!formData.enable,
          reportSchedule: {
            type: formData?.type || EventScheduleFrequency.Weekly,
            hour: formData?.hour || 12,
            minute: formData?.minute || 0,
            dayOfWeek: formData?.day || 'SUN',
            dayOfMonth: formData?.dayOfMonth || 1
          },
          recipients: formData?.recipients || []
        }
        try{
          // if already export schedule data available then use update export schedule
          // else it will add new schedule export
          const result = !isEmpty(scheduleExportData)
            ? await updateExportSchedules(saveData).unwrap()
            : await addExportSchedules(saveData).unwrap()
          onCloseDrawer()
          if (result) {
            showToast({
              type: 'success',
              content: $t(
                { defaultMessage: 'The {name} export will be ' +
                    'generated on scheduled date as selected ' },
                { name: saveData.type }
              )
            })
          }
        } catch (error) {
          showToast({
            type: 'error',
            content: $t(
              { defaultMessage: 'Export events not accessible!! {error} --- {name}' },
              { name: saveData.type }
            )
          })
        }
      }
    }
    catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
      return Promise.resolve()
    }
  }

  const onCloseDrawer = () => {
    form.resetFields()
    onClose()
  }

  const footer = (
    <Drawer.FormFooter
      buttonLabel={{
        save: $t({ defaultMessage: 'Apply' }) }}
      onSave={onSave}
      onCancel={onCloseDrawer}
    />
  )

  return <Drawer
    destroyOnClose={true}
    title={$t({ defaultMessage: 'Schedule Event Export' })}
    visible={visible}
    onClose={onClose}
    children={<ScheduleExportForm
      form={form}
      scheduleExportData={scheduleExportData}
      fetchingEditData={fetchingEditData}
      onSubmit={onSubmit}
    />}
    footer={footer}
  />
}