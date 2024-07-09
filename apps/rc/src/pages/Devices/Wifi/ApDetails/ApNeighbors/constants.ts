import { TABLE_DEFAULT_PAGE_SIZE } from '@acx-ui/utils'

export type ApNeighborTypes = 'lldp' | 'rf'

export const defaultPagination = { pageSize: TABLE_DEFAULT_PAGE_SIZE }

export const defaultSocketTimeout = 10000

export enum ApNeighborStatus {
  CURRENT = 'CURRENT'
}

export enum NewApNeighborTypes {
  RF_NEIGHBOR = 'RF_NEIGHBOR',
  LLDP_NEIGHBOR = 'LLDP_NEIGHBOR'
}
