"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ethers } from "ethers"
import axios from "axios"

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

  const router = useRouter()

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== "undefined" && window.ethereum !== undefined
  }

  // Get account balance
  const getBalance = async (address: string) => {
    if (!isMetaMaskInstalled()) return null

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const balance = await provider.getBalance(address)
      return ethers.formatEther(balance)
    } catch (error) {
      console.error("Error getting balance:", error)
      return null
    }
  }

  // Check if user is registered in the database
  const checkUserRegistration = async (address: string) => {
    try {
      const response = await axios.get(`/api/users/${address}`)
      if (response.status === 200 && response.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.error("Error checking user registration:", error)
      return null
    }
  }

  // Register a new user in the database
  const registerUser = async (userData: any) => {
    try {
      const response = await axios.post("/api/users", userData)
      if (response.status === 201) {
        setUserData(response.data)
        setRole(response.data.role)
        localStorage.setItem("userRole", response.data.role)
      }
    } catch (error) {
      console.error("Error registering user:", error)
      throw error
    }
  }

  // Connect to MetaMask
  const connect = async () => {
    if (!isMetaMaskInstalled()) {
      alert("MetaMask is not installed. Please install MetaMask to use this application.")
      return
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

      if (accounts.length > 0) {
        const currentAddress = accounts[0]
        setAddress(currentAddress)
        setIsConnected(true)

        // Get chain ID
        const chainId = await window.ethereum.request({ method: "eth_chainId" })
        setChainId(chainId)

        // Get balance
        const balance = await getBalance(currentAddress)
        setBalance(balance)

        // Check if user exists in database
        const user = await checkUserRegistration(currentAddress)

        if (user) {
          // User exists, set role and store in localStorage
          setRole(user.role)
          setUserData(user)
          localStorage.setItem("userRole", user.role)

          // Redirect to dashboard if not on role selection page
          if (window.location.pathname === "/auth") {
            router.push(`/dashboard/${user.role}`)
          }
        } else {
          // User doesn't exist, send to role selection
          router.push("/auth/role")
        }

        // Store connection state in localStorage
        localStorage.setItem("walletConnected", "true")
        localStorage.setItem("walletAddress", currentAddress)
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error)
    }
  }

  // Disconnect from MetaMask
  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    setChainId(null)
    setBalance(null)
    setRole(null)
    setUserData(null)

    // Clear connection state from localStorage
    localStorage.removeItem("walletConnected")
    localStorage.removeItem("walletAddress")
    localStorage.removeItem("userRole")

    // Redirect to home
    router.push("/")
  }

  // Check for existing connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled()) {
        const isWalletConnected = localStorage.getItem("walletConnected") === "true"
        const storedAddress = localStorage.getItem("walletAddress")
        const storedRole = localStorage.getItem("userRole")

        if (isWalletConnected && storedAddress) {
          // Verify the connection is still valid
          try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" })
            if (accounts.length > 0 && accounts[0] === storedAddress) {
              setAddress(accounts[0])
              setIsConnected(true)

              // Get chain ID
              const chainId = await window.ethereum.request({ method: "eth_chainId" })
              setChainId(chainId)

              // Get balance
              const balance = await getBalance(accounts[0])
              setBalance(balance)

              // Restore role from localStorage or fetch from database
              if (storedRole) {
                setRole(storedRole)

                // Fetch complete user data
                const user = await checkUserRegistration(accounts[0])
                if (user) {
                  setUserData(user)
                }
              } else {
                // Fetch user info from database
                const user = await checkUserRegistration(accounts[0])
                if (user) {
                  setRole(user.role)
                  setUserData(user)
                  localStorage.setItem("userRole", user.role)
                }
              }
            } else {
              // Clear invalid connection state
              disconnect()
            }
          } catch (error) {
            console.error("Error checking connection:", error)
            disconnect()
          }
        }

        // Listen for account changes
        window.ethereum.on("accountsChanged", (accounts: string[]) => {
          if (accounts.length === 0) {
            disconnect()
          } else {
            setAddress(accounts[0])
            localStorage.setItem("walletAddress", accounts[0])

            // Check if the new account is registered
            checkUserRegistration(accounts[0]).then((user) => {
              if (user) {
                setRole(user.role)
                setUserData(user)
                localStorage.setItem("userRole", user.role)

                // Redirect to dashboard
                router.push(`/dashboard/${user.role}`)
              } else {
                // New account not registered, send to role selection
                setRole(null)
                setUserData(null)
                localStorage.removeItem("userRole")
                router.push("/auth/role")
              }
            })
          }
        })

        // Listen for chain changes
        window.ethereum.on("chainChanged", (chainId: string) => {
          setChainId(chainId)

          // Update balance on chain change
          if (address) {
            getBalance(address).then((balance) => setBalance(balance))
          }
        })
      }
    }

    checkConnection()

    // Clean up event listeners
    return () => {
      if (isMetaMaskInstalled()) {
        window.ethereum.removeAllListeners("accountsChanged")
        window.ethereum.removeAllListeners("chainChanged")
      }
    }
  }, [router])

  return (
    <WalletContext.Provider
      value={{
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
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
