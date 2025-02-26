import React from 'react'
export const ConnectorForm = React.lazy(() => import('./ConnectorForm'))
export const DataConnectorContent = React.lazy(() => import('./Content'))
export const DataConnectorAuditLog = React.lazy(() => import('./AuditLog'))
export const CloudStorageForm = React.lazy(
  () => import('./CloudStorageForm')
)
