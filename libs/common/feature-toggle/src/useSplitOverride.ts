import { useState, useEffect, useCallback } from 'react'

import { SplitSdk } from '@splitsoftware/splitio-react'

import { get } from '@acx-ui/config'

import type SplitIO from '@splitsoftware/splitio-react/types/splitio/splitio'

interface ClientCache {
  [key: string]: SplitIO.IClient;
}

interface CleanupTimers {
  [key: string]: NodeJS.Timeout;
}

interface Treatments {
  [key: string]: string;
}

interface SplitOverrideResult {
  treatments: Treatments;
  isReady: boolean;
  error?: Error;
}

// Cache for Split clients to avoid recreating them
const clientCache: ClientCache = {}
const cleanupTimers: CleanupTimers = {} // Tracks when to clean up unused clients

const CLIENT_CLEANUP_TIMEOUT = 5 * 60 * 1000 // 5 minutes
const DEFAULT_TIMEOUT = 5000 // 5 seconds for client operations

const createSplitClient = (
  overrideKey: string, splitKey: string, splitProxy?: string
): SplitIO.IClient => {
  const factory = SplitSdk({
    core: {
      authorizationKey: splitKey,
      key: overrideKey
    },
    ...(splitProxy ? { urls: {
      sdk: splitProxy,
      events: splitProxy,
      auth: splitProxy
    } } : {})
  })
  return factory.client()
}

const cleanupClient = (overrideKey: string): void => {
  if (clientCache[overrideKey]) {
    clientCache[overrideKey].destroy()
    delete clientCache[overrideKey]
  }
  if (cleanupTimers[overrideKey]) {
    clearTimeout(cleanupTimers[overrideKey])
    delete cleanupTimers[overrideKey]
  }
}

const useSplitOverride = (overrideKey: string, featureFlags: string[]): SplitOverrideResult => {
  const [treatments, setTreatments] = useState<Treatments>({})
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error>()

  const splitKey = get('SPLIT_IO_KEY')
  const splitProxy = get('SPLIT_PROXY_ENDPOINT')

  const handleSDKReady = useCallback((client: SplitIO.IClient) => {
    try {
      const newTreatments: Treatments = {}
      featureFlags.forEach(flag => {
        newTreatments[flag] = client.getTreatment(flag)
      })
      setTreatments(newTreatments)
      setIsReady(true)
      setError(undefined)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get treatments'))
      setIsReady(false)
    }
  }, [featureFlags])

  useEffect(() => {
    if (!overrideKey || !featureFlags || featureFlags.length === 0) {
      return
    }

    // Clear any pending cleanup for this key (prevents premature cleanup)
    if (cleanupTimers[overrideKey]) {
      clearTimeout(cleanupTimers[overrideKey])
      delete cleanupTimers[overrideKey]
    }

    let client: SplitIO.IClient

    try {
      // Check if a client already exists for this key
      if (!clientCache[overrideKey]) {
        client = createSplitClient(overrideKey, splitKey, splitProxy)
        clientCache[overrideKey] = client
      } else {
        client = clientCache[overrideKey]
      }

      const handleReady = () => handleSDKReady(client)
      client.on(client.Event.SDK_READY, handleReady)

      // Set up a timeout to ensure we don't wait forever for SDK_READY
      const timeoutId = setTimeout(() => {
        if (!isReady) {
          setError(new Error('Split SDK ready timeout'))
          setIsReady(false)
        }
      }, DEFAULT_TIMEOUT)

      return () => {
        clearTimeout(timeoutId)
        client.off(client.Event.SDK_READY, handleReady)

        // Delay cleanup to remove the client if unused for too long
        cleanupTimers[overrideKey] = setTimeout(() => {
          cleanupClient(overrideKey)
        }, CLIENT_CLEANUP_TIMEOUT)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create Split client'))
      setIsReady(false)
      return undefined
    }
  }, [overrideKey, featureFlags, splitKey, splitProxy, handleSDKReady, isReady])

  return { treatments, isReady, error }
}

export { useSplitOverride }
