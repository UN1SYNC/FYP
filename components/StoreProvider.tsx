'use client'
import { useMemo } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '../lib/store' // Import your store and persistor

export default function StoreProvider({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}
