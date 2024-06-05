import { Features, useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { useApGroupsListQuery, useNewApGroupsListQuery } from '@acx-ui/rc/services'

const defaultApGroupsFilterOptsPayload = {
  fields: ['name', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC',
  filters: { isDefault: [false] }
}

export const useApGroupsFilterOpts =
  (filters?: Record<string, unknown[]>)
   : ({ key: string, value: string }[] | boolean) => {
    const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
    const payload = {
      ...defaultApGroupsFilterOptsPayload,
      ...(filters && { filters })
    }

    const { apGroupOptions: apGroupOptionsRbac } = useNewApGroupsListQuery({
      payload
    }, {
      skip: !isWifiRbacEnabled,
      selectFromResult: ({ data }) => ({
        apGroupOptions: data?.data.map((v) => ({ key: v.id!, value: v.name! })) || true
      })
    })

    const { apGroupOptions: apGroupOptionsNonRbac } = useApGroupsListQuery({
      payload
    }, {
      skip: isWifiRbacEnabled,
      selectFromResult: ({ data }) => ({
        apGroupOptions: data?.data.map((v) => ({ key: v.id, value: v.name })) || true
      })
    })

    return isWifiRbacEnabled ? apGroupOptionsRbac : apGroupOptionsNonRbac
  }