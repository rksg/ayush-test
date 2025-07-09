import React, { useCallback, useState } from 'react'

import { message, Form, Input, Select } from 'antd'
import { TransferItem }                 from 'antd/lib/transfer'
import { useIntl }                      from 'react-intl'

import { Drawer, Loader, Transfer }                                     from '@acx-ui/components'
import { useAddApGroupMutation, useVenuesListQuery, useNewApListQuery } from '@acx-ui/rc/services'

interface ApGroupDrawerProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  venueId?: string
  tenantId?: string
}

export const ApGroupDrawer: React.FC<ApGroupDrawerProps> = ({
  open,
  onClose,
  onSuccess,
  tenantId
}) => {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const [targetKeys, setTargetKeys] = useState<string[]>([])
  const [addApGroup] = useAddApGroupMutation()

  // Get venues list
  const { data: venuesData, isLoading: venuesLoading } = useVenuesListQuery({
    payload: {
      fields: ['id', 'name'],
      pageSize: 1000
    },
    enableRbac: true
  })

  // Get selected venue ID from form
  const selectedVenueId = Form.useWatch('venueId', form)

  // Clear selected APs when venue changes
  React.useEffect(() => {
    setTargetKeys([])
  }, [selectedVenueId])

  // Get APs list filtered by selected venue
  const { data: apsData, isLoading: apsLoading } = useNewApListQuery({
    payload: {
      fields: ['serialNumber', 'name', 'apGroupName', 'tags', 'venueId'],
      pageSize: 10000,
      filters: selectedVenueId ? { venueId: [selectedVenueId] } : {}
    },
    enableRbac: true,
    skip: !selectedVenueId
  })

  // Transform venues data for Select
  const venueOptions = venuesData?.data?.map(venue => ({
    label: venue.name,
    value: venue.id
  })) || []

  // Transform APs data for Transfer - only show APs when venue is selected
  const apItems: TransferItem[] = selectedVenueId && apsData?.data ? apsData.data.map(ap => ({
    key: ap.serialNumber,
    title: ap.name || ap.serialNumber,
    description: ap.apGroupName || '',
    disabled: false,
    apGroupName: ap.apGroupName,
    tags: ap.tags || []
  })) : []

  const handleCancel = useCallback(() => {
    form.resetFields()
    setTargetKeys([])
    onClose()
  }, [form, onClose])

  const handleSuccess = useCallback(async () => {
    try {
      const values = await form.validateFields()

      // Prepare payload for API
      const payload = {
        name: values.name,
        venueId: values.venueId,
        apSerialNumbers: targetKeys.map(key => ({ serialNumber: key }))
      }

      // Call API
      await addApGroup({
        params: { venueId: values.venueId },
        payload,
        enableRbac: true
      }).unwrap()

      message.success($t({ defaultMessage: 'AP Group added successfully' }))
      onSuccess?.()
      onClose()
      form.resetFields()
      setTargetKeys([])
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to create AP Group:', error)
      message.error($t({ defaultMessage: 'Failed to create AP Group' }))
    }
  }, [form, targetKeys, addApGroup, tenantId, onSuccess, onClose, $t])

  const handleTransfer = (newTargetKeys: string[]) => {
    setTargetKeys(newTargetKeys)
  }

  const renderItem = (item: TransferItem) => {
    return (
      <div>
        <div>{item.title}</div>
        {item.apGroupName && (
          <div style={{ fontSize: '10px', color: '#666' }}>
            Group: {item.apGroupName}
          </div>
        )}
      </div>
    )
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add AP Group' })}
      visible={open}
      onClose={handleCancel}
      width={600}
      destroyOnClose={true}
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'Save' })
          }}
          onCancel={handleCancel}
          onSave={async () => {
            await handleSuccess()
          }}
        />
      }
    >
      <Form
        form={form}
        layout='vertical'
        style={{ padding: '20px' }}
      >
        {/* Group Details */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '16px' }}>
            {$t({ defaultMessage: 'Group Details' })}
          </h4>

          <Form.Item
            name='name'
            label={$t({ defaultMessage: 'Group Name' })}
            rules={[
              {
                required: true,
                message: $t({ defaultMessage: 'Group name is required' })
              },
              {
                min: 2,
                message: $t({ defaultMessage: 'Group name must be at least 2 characters' })
              },
              {
                max: 64,
                message: $t({ defaultMessage: 'Group name must be less than 64 characters' })
              }
            ]}
          >
            <Input placeholder={$t({ defaultMessage: 'Enter group name' })} />
          </Form.Item>

          <Form.Item
            name='venueId'
            label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
            rules={[
              {
                required: true,
                message: $t({ defaultMessage: '<VenueSingular></VenueSingular> is required' })
              }
            ]}
          >
            <Select
              placeholder={$t({
                defaultMessage: 'Select <venueSingular></venueSingular>'
              })}
              options={venueOptions}
              loading={venuesLoading}
            />
          </Form.Item>
        </div>

        {/* Group Member */}
        <div>
          <h4 style={{
            marginBottom: '16px',
            padding: '10px 0px',
            fontSize: 'var(--acx-subtitle-4-font-size)',
            fontWeight: 'var(--acx-subtitle-4-font-weight)',
            lineHeight: 'var(--acx-subtitle-4-line-height)'
          }}>
            {$t({ defaultMessage: 'Group Member' })}
          </h4>

          <Form.Item
            name='apSerialNumbers'
            valuePropName='targetKeys'
          >
            <Loader states={[{ isLoading: apsLoading }]}>
              <Transfer
                dataSource={apItems}
                targetKeys={targetKeys}
                onChange={handleTransfer}
                render={renderItem}
                showSearch={true}
                showSelectAll={false}
                listStyle={{ width: 150, height: 300 }}
                operations={['Add', 'Remove']}
                titles={[
                  $t({ defaultMessage: 'Available APs' }),
                  $t({ defaultMessage: 'Selected APs' })
                ]}
              />
            </Loader>
          </Form.Item>
        </div>
      </Form>
    </Drawer>
  )
}