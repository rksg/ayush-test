import { useEffect, useRef, useState } from 'react'

import { Tree, TreeProps } from 'antd'
import { DataNode }        from 'antd/lib/tree'
import { includes }        from 'lodash'
import { useIntl }         from 'react-intl'
import { useParams }       from 'react-router-dom'

import { Drawer }                            from '@acx-ui/components'
import { useLazyGetCcdSupportApGroupsQuery } from '@acx-ui/rc/services'
import { SupportCcdApGroup }                 from '@acx-ui/rc/utils'

import { ApInfo } from './contents'

type ApGroupSelecterDrawerProps = {
  visible: boolean,
  venueId?: string,
  updateSelectAps: (aps: string[], apGroups:string[]) => void,
  updateSelectApsInfo: (apsInfo: ApInfo[]) => void,
  onCancel: () => void
}

const ApGroupSelecterDrawer = (props: ApGroupSelecterDrawerProps) => {
  const { $t } = useIntl()
  const { tenantId } = useParams()

  const { visible, venueId, updateSelectAps, updateSelectApsInfo } = props

  const [ getApsByApGroup ] = useLazyGetCcdSupportApGroupsQuery()

  const selectedKeysRef = useRef<string[]>()
  const apGroupMapRef = useRef<Map<string, string>>()
  const apListRef = useRef<ApInfo[]>()

  const [ apsTreeData, setApsTreeData] = useState<DataNode[]>([])

  useEffect(() => {
    if (venueId) {
      const converteToTreeData = (apGroupData?: SupportCcdApGroup[]) => {
        if (apGroupData) {
          const apList: ApInfo[] = []
          const apGroupMap = new Map()
          const treeData = apGroupData.map(data => {
            const { apGroupName, apGroupId, members, aps } = data
            const groupName = (apGroupName ==='')? 'Ungrouped APs' : apGroupName

            apGroupMap.set(apGroupId, groupName)

            const childrenTreeData = aps?.map(ap => {
              const { name, apMac, serialNumber, model } = ap
              apList.push({ name, apMac, serialNumber, model })
              return {
                title: `${name} (${apMac})`,
                key: `${apGroupId}-${serialNumber}`
              }
            })

            return {
              title: `${groupName} (${members} APs)`,
              key: apGroupId,
              children: childrenTreeData
            }
          })

          apGroupMapRef.current = apGroupMap
          apListRef.current = apList

          return treeData
        }
        return []
      }

      const createAPGroupTreeData = async (venueId: string) => {
        const { data } = await getApsByApGroup({ params: { tenantId, venueId } }, true)
        const treeData = converteToTreeData(data as SupportCcdApGroup[])

        setApsTreeData(treeData as DataNode[])
      }

      createAPGroupTreeData(venueId)
    }

  }, [venueId])

  const onApsCheck: TreeProps['onCheck'] = (checkedKeys) => {
    selectedKeysRef.current = checkedKeys as string[]
  }

  const content = (<Tree checkable
    onCheck={onApsCheck}
    treeData={apsTreeData}
  />)

  // reset form fields when drawer is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      selectedKeysRef.current = []
    }
  }


  return (
    <Drawer
      title={$t({ defaultMessage: 'Select Available APs' })}
      visible={visible}
      onClose={props.onCancel}
      children={content}
      destroyOnClose={true}
      width={'500px'}
      afterVisibleChange={handleOpenChange}
      footer={
        <Drawer.FormFooter
          buttonLabel={({
            save: $t({ defaultMessage: 'Apply' })
          })}
          onCancel={props.onCancel}
          onSave={async () => {
            try {
              const selectedKeys = selectedKeysRef.current
              const selectedApKeys = selectedKeys?.filter(key => key.includes('-')) || []
              const selectedAps = selectedApKeys.map(apKey => apKey.split('-')[1])

              const apgMap = apGroupMapRef.current

              let selectedApGroups = []
              if (apgMap) {
                for (let key of apgMap.keys()) {
                  const aps = selectedApKeys.filter(apKey => apKey.includes(key+'-'))
                  const numOfAps = (aps && aps.length) || 0
                  if (numOfAps > 0) {
                    const apgName = apgMap.get(key)
                    selectedApGroups.push(`${apgName} (${numOfAps} APs)`)
                  }
                }
              }

              let selectApsInfo: ApInfo[] = []
              const apsInfo = apListRef.current
              if (apsInfo) {
                selectApsInfo = apsInfo?.filter((apInfo) => (
                  includes(selectedAps, apInfo.serialNumber)))
              }

              updateSelectAps(selectedAps, selectedApGroups)
              updateSelectApsInfo(selectApsInfo)
              props.onCancel()
            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
    />
  )
}

export default ApGroupSelecterDrawer

