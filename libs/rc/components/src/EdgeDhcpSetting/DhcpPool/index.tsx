import { useState } from 'react'

import { useIntl }      from 'react-intl'
import { v4 as uuidv4 } from 'uuid'

import { showActionModal }                                                       from '@acx-ui/components'
import { EdgeDhcpPool, IpInSubnetPool, networkWifiIpRegExp, subnetMaskIpRegExp } from '@acx-ui/rc/utils'

import { useTableControl }           from '..'
import { CsvSize, ImportFileDrawer } from '../../ImportFileDrawer'

import { PoolDrawer } from './PoolDrawer'
import { PoolTable }  from './PoolTable'

type DhcpPoolTableProps = {
  value?: EdgeDhcpPool[]
  onChange?: (data: EdgeDhcpPool[]) => void
}

const importTemplateLink = 'assets/templates/edge_dhcp_import_template.csv'
export default function DhcpPoolTable ({
  value = [],
  onChange
}: DhcpPoolTableProps) {
  const { $t } = useIntl()
  const [importModalvisible, setImportModalvisible] = useState<boolean>(false)
  const {
    openDrawer,
    onDelete,
    visible,
    setVisible,
    onAddOrEdit,
    currentEditData
  } = useTableControl({ value, onChange })

  const validateCSVData = async (data: EdgeDhcpPool[]): Promise<void> => {
    // find duplicate pool name
    const count = data.concat(value).reduce((result, item) => ({ ...result,
      [item.poolName]: (result[item.poolName] || 0) + 1
    }), {} as { [key:string]: number })

    const hasDuplicates = Object.keys(count).filter((a) => count[a] > 1).length > 0
    if (hasDuplicates)
      return Promise.reject($t({ defaultMessage: 'Pool name should be unique' }))


    // validation on other fields
    for(let i = 0; i < data.length; i++) {
      const item = data[i]
      try {
        await Promise.all([
          subnetMaskIpRegExp(item.subnetMask),
          networkWifiIpRegExp(item.poolStartIp),
          networkWifiIpRegExp(item.poolEndIp),
          networkWifiIpRegExp(item.gatewayIp),
          IpInSubnetPool(
            item.poolEndIp,
            item.poolStartIp,
            item.subnetMask
          )])
      } catch(er) {
        return Promise.reject(er)
      }
    }

    return Promise.resolve()
  }

  const appendDHCPPools = async (content: string) => {
    if (!onChange) return

    const dataArray = content.split('\n')
      .filter(row => {
        const trimmed = row.trim()
        return trimmed
          && !trimmed.startsWith('#')
          && trimmed !== 'Pool Name Subnet Mask Start IP Address End IP Address Gateway IP'
      })


    const newValues: EdgeDhcpPool[] = dataArray.map((item) => {
      const fields = item.split(' ')
      return {
        id: '_NEW_'+uuidv4(),
        poolName: fields[0],
        subnetMask: fields[1],
        poolStartIp: fields[2],
        poolEndIp: fields[3],
        gatewayIp: fields[4]
      } as EdgeDhcpPool
    })

    try {
      await validateCSVData(newValues)
      if (onChange)
        onChange(value.concat(newValues))
    } catch (error) {
      showActionModal({
        type: 'error',
        title: $t({ defaultMessage: 'Invalid Validation' }),
        content: error as string
      })
    }
  }

  return (
    <>
      <PoolTable
        data={value}
        openDrawer={openDrawer}
        openImportModal={setImportModalvisible}
        onDelete={onDelete}
      />
      <PoolDrawer
        visible={visible}
        setVisible={setVisible}
        onAddOrEdit={onAddOrEdit}
        data={currentEditData}
        allPool={value}
      />
      <ImportFileDrawer
        type='EdgeDHCP'
        title={$t({ defaultMessage: 'Import from file' })}
        maxSize={CsvSize['2MB']}
        acceptType={['csv']}
        templateLink={importTemplateLink}
        visible={importModalvisible}
        readAsText={true}
        importRequest={(formData, values, content)=>{
          appendDHCPPools(content!)
          setImportModalvisible(false)
        }}
        onClose={()=>setImportModalvisible(false)}
      />
    </>
  )
}
