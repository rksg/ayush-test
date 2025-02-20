import React from 'react'
export const SubscriptionForm = React.lazy(() => import('./ConnectorForm'))
export const DataSubscriptionsContent = React.lazy(() => import('./Content'))
export const DataSubscriptionsAuditLog = React.lazy(() => import('./AuditLog'))
export const CloudStorageForm = React.lazy(
  () => import('./CloudStorageForm')
)
