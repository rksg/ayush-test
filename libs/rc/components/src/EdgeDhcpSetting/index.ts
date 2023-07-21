import { useEffect, useRef, useState } from 'react'

import { Form }          from 'antd'
import _                 from 'lodash'
import { defineMessage } from 'react-intl'
import { v4 as uuidv4 }  from 'uuid'

import { EdgeDhcpOptionsEnum } from '@acx-ui/rc/utils'

export const useTableControl = <T>(option:{
  value: T[],
  onChange?: (data: T[]) => void,
  key?: string
}) => {
  const { value, onChange, key='id' } = option
  const valueMap = useRef<Record<string, T>>({})
  const [visible, setVisible] = useState(false)
  const [currentEditData, setCurrentEditData] = useState<T>()
  useEffect(()=> {
    valueMap.current = value ? _.keyBy(value, key) : {}
  }, [value])

  const openDrawer = (item?: T) => {
    setCurrentEditData(item)
    setVisible(true)
  }

  const onAddOrEdit = (item: T) => {
    valueMap.current[item[key as keyof T] as unknown as string] = item
    onChange?.(Object.values(valueMap.current))
  }

  const onDelete = (items: T[]) => {
    items.forEach(item => {
      delete valueMap.current[item[key as keyof T] as unknown as string]
    })
    onChange?.(Object.values(valueMap.current))
  }
  return {
    visible,
    setVisible,
    currentEditData,
    openDrawer,
    onAddOrEdit,
    onDelete
  }
}

export const dhcpOptions = [
  {
    id: EdgeDhcpOptionsEnum.DOMAIN_SERVER,
    name: defineMessage({ defaultMessage: 'Domain Server' })
  },
  {
    id: EdgeDhcpOptionsEnum.DOMAIN_NAME,
    name: defineMessage({ defaultMessage: 'Domain name' })
  },
  {
    id: EdgeDhcpOptionsEnum.NTP_SERVERS,
    name: defineMessage({ defaultMessage: 'NTP Servers' })
  },
  {
    id: EdgeDhcpOptionsEnum.VENDOR_ENCAPSULATED_OPTIONS,
    name: defineMessage({ defaultMessage: 'vendor-encapsulated-options' })
  },
  {
    id: EdgeDhcpOptionsEnum.NETBIOS_SCOPE,
    name: defineMessage({ defaultMessage: 'NETBIOS Scope' })
  },
  {
    id: EdgeDhcpOptionsEnum.VENDOR_CLASS_IDENTIFIER,
    name: defineMessage({ defaultMessage: 'vendor-class-identifier' })
  },
  {
    id: EdgeDhcpOptionsEnum.SERVER_NAME,
    name: defineMessage({ defaultMessage: 'Server-Name' })
  },
  {
    id: EdgeDhcpOptionsEnum.BOOTFILE_NAME,
    name: defineMessage({ defaultMessage: 'Bootfile-Name' })
  }
]

export const useDrawerControl = <T>(option: {
  visible: boolean,
  setVisible: React.Dispatch<React.SetStateAction<boolean>>,
  data?: T,
  key?: string,
  initData: Partial<T>,
  onAddOrEdit: (item: T) => void
}) => {
  type ValueOf<T> = T[keyof T]
  const { visible, setVisible, data, key='id', initData, onAddOrEdit } = option

  const [form] = Form.useForm()

  useEffect(() => {
    if(visible) {
      form.resetFields()
      form.setFieldsValue(data)
    }
  }, [visible, form, data])

  const onClose = () => {
    setVisible(false)
  }

  const onSave = async (addAnotherChecked: boolean) => {
    try {
      await form.validateFields()
      form.submit()

      if (!addAnotherChecked) {
        onClose()
      }
    } catch (error) {
      // if (error instanceof Error) throw error
    }
  }

  const onSubmit = () => {
    const data = form.getFieldsValue(true) as T
    if (data[key as keyof T] === initData[key as keyof T]) {
      data[key as keyof T] = '_NEW_'+ uuidv4() as unknown as ValueOf<T>
    }

    onAddOrEdit(data)
    form.resetFields()
  }

  return {
    form,
    onClose,
    onSave,
    onSubmit
  }
}