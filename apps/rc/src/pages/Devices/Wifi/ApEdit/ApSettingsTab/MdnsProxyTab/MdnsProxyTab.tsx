import { useEffect } from 'react'

import {
  Form,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { GridCol, GridRow, Loader } from '@acx-ui/components'
import { MdnsProxySelector }        from '@acx-ui/rc/components'
import { useGetApQuery }            from '@acx-ui/rc/services'
import { useParams }                from '@acx-ui/react-router-dom'

export function MdnsProxyTab () {
  const [ form ] = Form.useForm()
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const serviceEnabled = Form.useWatch<boolean>('serviceEnabled', form)
  const {
    data: apDetail,
    isFetching,
    isLoading,
    isSuccess
  } = useGetApQuery({ params: { tenantId, serialNumber } })

  useEffect(() => {
    if (isSuccess) {
      const serviceId = apDetail.multicastDnsProxyServiceProfileId

      form.setFieldValue('serviceEnabled', !!serviceId)
      form.setFieldValue('serviceId', serviceId)
    }
  }, [apDetail, isSuccess])

  return (
    <Loader states={[{
      isLoading,
      isFetching
    }]}>
      <GridRow>
        <GridCol col={{ span: 7 }}>
          <Form form={form}>
            <Form.Item
              name='serviceEnabled'
              label={$t({ defaultMessage: 'Activate Service' })}
              valuePropName='checked'
            >
              <Switch />
            </Form.Item>
          </Form>
          {serviceEnabled &&
            <Form layout='vertical' form={form}>
              <MdnsProxySelector
                formItemProps={{
                  name: 'serviceId',
                  rules: [{ required: true }]
                }}
              />
            </Form>
          }
        </GridCol>
      </GridRow>
    </Loader>
  )
}
