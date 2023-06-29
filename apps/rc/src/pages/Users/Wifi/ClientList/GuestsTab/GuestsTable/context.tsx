import { createContext } from 'react'

export const GuestTabContext = createContext({} as {
  setGuestCount: (data: number) => void
})
