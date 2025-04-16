"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ethers } from "ethers"
import axios from "axios"

interface Window {
  ethereum?: {
    request: (args: { method: string }) => Promise<any>
    on: (event: string, callback: (args: any) => void) => void
    removeAllListeners: (event: string) => void
  }
}

interface WalletContextType {
  isConnected: boolean
  address: string | null
  chainId: string | null
  balance: string | null
  role: string | null
  userData: any | null
  connect: () => Promise<void>
  disconnect: () => void
  checkUserRegistration: (address: string) => Promise<any>
  registerUser: (userData: any) => Promise<void>
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: null,
  chainId: null,
  balance: null,
  role: null,
  userData: null,
  connect: async () => {},
  disconnect: () => {},
  checkUserRegistration: async () => null,
  registerUser: async () => {},
})

export const useWallet = () => useContext(WalletContext)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [userData, setUserData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()

  // Memoize MetaMask check
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== "undefined" && window.ethereum !== undefined
  }, [])

  // Memoize balance fetching
  const getBalance = useCallback(async (address: string) => {
    if (!isMetaMaskInstalled()) return null

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const balance = await provider.getBalance(address)
      return ethers.formatEther(balance)
    } catch (error) {
      console.error("Error getting balance:", error)
      return null
    }
  }, [isMetaMaskInstalled])

  // Memoize user registration check
  const checkUserRegistration = useCallback(async (address: string) => {
    try {
      const response = await axios.get(`/api/users/${address}`)
      if (response.status === 200 && response.data) {
        setRole(response.data.role)
        setUserData(response.data)
        return response.data
      }
      return null
    } catch (error) {
      console.error("Error checking user registration:", error)
      return null
    }
  }, [])

  // Memoize user registration
  const registerUser = useCallback(async (userData: any) => {
    try {
      const existingUser = await checkUserRegistration(userData.walletAddress)
      if (existingUser) {
        router.push(`/dashboard/${existingUser.role}`)
        return
      }

      const response = await axios.post("/api/users", userData)
      if (response.status === 201) {
        setUserData(response.data)
        setRole(response.data.role)
        router.push(`/dashboard/${response.data.role}`)
      }
    } catch (error: any) {
      console.error("Error registering user:", error)
      if (error.response?.status === 409) {
        const existingUser = await checkUserRegistration(userData.walletAddress)
        if (existingUser) {
          router.push(`/dashboard/${existingUser.role}`)
          return
        }
        throw new Error("User with this wallet address already exists")
      }
      throw new Error(error.response?.data?.error || "Failed to register user")
    }
  }, [checkUserRegistration, router])

  // Memoize connection function
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      alert("MetaMask is not installed. Please install MetaMask to use this application.")
      return
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      if (accounts.length > 0) {
        const currentAddress = accounts[0]
        setAddress(currentAddress)
        setIsConnected(true)

        // Parallel requests for better performance
        const [chainId, balance] = await Promise.all([
          window.ethereum.request({ method: "eth_chainId" }),
          getBalance(currentAddress)
        ])
        setChainId(chainId)
        setBalance(balance)

        const user = await checkUserRegistration(currentAddress)
        if (user) {
          router.push(`/dashboard/${user.role}`)
        } else {
          router.push("/auth/role")
        }
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error)
    }
  }, [isMetaMaskInstalled, getBalance, checkUserRegistration, router])

  // Memoize disconnect function
  const disconnect = useCallback(() => {
    setIsConnected(false)
    setAddress(null)
    setChainId(null)
    setBalance(null)
    setRole(null)
    setUserData(null)
    router.push("/")
  }, [router])

  // Optimize initial connection check
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setAddress(accounts[0])
            setIsConnected(true)

            // Parallel requests for better performance
            const [chainId, balance] = await Promise.all([
              window.ethereum.request({ method: "eth_chainId" }),
              getBalance(accounts[0])
            ])
            setChainId(chainId)
            setBalance(balance)

            const user = await checkUserRegistration(accounts[0])
            if (user) {
              router.push(`/dashboard/${user.role}`)
            }
          }
        } catch (error) {
          console.error("Error checking connection:", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    checkConnection()

    // Memoize event handlers
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        setAddress(accounts[0])
        setIsConnected(true)
        const user = await checkUserRegistration(accounts[0])
        if (user) {
          router.push(`/dashboard/${user.role}`)
        }
      }
    }

    const handleChainChanged = (chainId: string) => {
      setChainId(chainId)
      if (address) {
        getBalance(address).then((balance) => setBalance(balance))
      }
    }

    if (isMetaMaskInstalled()) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
    }

    return () => {
      if (isMetaMaskInstalled()) {
        window.ethereum.removeAllListeners("accountsChanged")
        window.ethereum.removeAllListeners("chainChanged")
      }
    }
  }, [isMetaMaskInstalled, getBalance, checkUserRegistration, disconnect, router, address])

  // Memoize context value
  const contextValue = useMemo(() => ({
    isConnected,
    address,
    chainId,
    balance,
    role,
    userData,
    connect,
    disconnect,
    checkUserRegistration,
    registerUser,
  }), [isConnected, address, chainId, balance, role, userData, connect, disconnect, checkUserRegistration, registerUser])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}
