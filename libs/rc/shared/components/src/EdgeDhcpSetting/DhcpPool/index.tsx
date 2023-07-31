import { useState } from 'react'

import { useIntl }      from 'react-intl'
import { v4 as uuidv4 } from 'uuid'

import { showActionModal }                                                       from '@acx-ui/components'
import { EdgeDhcpPool, IpInSubnetPool, networkWifiIpRegExp, subnetMaskIpRegExp } from '@acx-ui/rc/utils'
import { validationMessages }                                                    from '@acx-ui/utils'

import { useTableControl }                                 from '..'
import { CsvSize, ImportFileDrawer, ImportFileDrawerType } from '../../ImportFileDrawer'

import { PoolDrawer } from './PoolDrawer'
import { PoolTable }  from './PoolTable'

type DhcpPoolTableProps = {
  value?: EdgeDhcpPool[]
  onChange?: (data: EdgeDhcpPool[]) => void
}

const importTemplateLink = 'assets/templates/edge_dhcp_import_template.csv'
const MAX_IMPORT_ENTRIES = 128
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
  } = useTableControl<EdgeDhcpPool>({ value, onChange })

  const validateCSVData = async (data: EdgeDhcpPool[]): Promise<void> => {
    // find duplicate pool name
    const count = data.concat(value).reduce((result, item) => ({ ...result,
      [item.poolName]: (result[item.poolName] || 0) + 1
    }), {} as { [key:string]: number })

    const hasDuplicates = Object.keys(count).filter((a) => count[a] > 1).length > 0
    if (hasDuplicates) {
      const entityName = $t({ defaultMessage: 'Pool Name' })
      return Promise.reject($t(validationMessages.duplication, {
        entityName: entityName,
        key: $t({ defaultMessage: 'name' }),
        extra: ''
      }))
    }


    // validation on other fields
    for(let i = 0; i < data.length; i++) {
      const item = data[i]

      try {
        await subnetMaskIpRegExp(item.subnetMask)
        await networkWifiIpRegExp(item.poolStartIp)
        await networkWifiIpRegExp(item.poolEndIp)
        await networkWifiIpRegExp(item.gatewayIp)
        await IpInSubnetPool(
          item.poolEndIp,
          item.poolStartIp,
          item.subnetMask
        )
      } catch (error) {
        return Promise.reject(error)
      }
    }

    return Promise.resolve()
  }

  const appendDHCPPools = async (content: string[], callback: () => void) => {
    const newValues: EdgeDhcpPool[] = content.map((item) => {
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
      onChange && onChange(value.concat(newValues))
      callback()
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
        type={ImportFileDrawerType.EdgeDHCP}
        title={$t({ defaultMessage: 'Import from file' })}
        maxSize={CsvSize['5MB']}
        maxEntries={MAX_IMPORT_ENTRIES}
        acceptType={['csv']}
        templateLink={importTemplateLink}
        visible={importModalvisible}
        readAsText={true}
        importRequest={(formData, values, content) => {
          const dataArray = content!.split('\n').filter(row => {
            const trimmed = row.trim()
            return trimmed
                  && !trimmed.startsWith('#')
                  && trimmed !== 'Pool Name Subnet Mask Pool Start IP Pool End IP Gateway'
          })

          if (dataArray.length > MAX_IMPORT_ENTRIES) {
            showActionModal({
              type: 'error',
              title: $t({ defaultMessage: 'Invalid Validation' }),
              content: $t({ defaultMessage: 'Exceed maximum entries.' })
            })
            return
          }

          appendDHCPPools(
            dataArray,
            () => setImportModalvisible(false)
          )
        }}
        onClose={() => setImportModalvisible(false)}
      />
    </>
  )
}
