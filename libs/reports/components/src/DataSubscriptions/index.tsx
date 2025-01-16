import React from 'react'
export const SubscriptionForm = React.lazy(() => import('./SubscriptionForm'))
export const DataSubscriptionsContent = React.lazy(() => import('./DataSubscriptionsContent'))
export const DataSubscriptionsAuditLog = React.lazy(() => import('./DataSubscriptionsAuditLog'))
export const CloudStorageForm = React.lazy(
  () => import('./CloudStorageForm')
)
