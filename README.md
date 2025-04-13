# MEDX - Blockchain-Powered Pharmaceutical Supply Chain

This project is a Next.js application designed to simulate and manage a pharmaceutical supply chain using blockchain technology for enhanced transparency and traceability. It features role-based access control for different actors in the supply chain (Providers, Manufacturers, Distributors, Retailers).

## Features

* **Role-Based Dashboards:** Separate dashboard views and functionalities tailored for Providers, Manufacturers, Distributors, and Retailers.
* **User Management:** Wallet-based authentication (MetaMask), user registration, and profile management.
* **Inventory Management:** Add, view, and manage inventory items (raw materials or finished products depending on role).
* **Order Management:** Create, view (incoming/outgoing), and potentially update the status of orders.
* **Blockchain Integration:**
    * Create orders on an Ethereum-compatible blockchain using a smart contract (via Ethers.js).
    * Track order status updates potentially linked to blockchain events.
    * Database records updated with blockchain transaction details.
* **Supply Chain Tracking:** View the history and journey of products or orders through the supply chain.
* **Real-time Notifications (Optional):** Uses Socket.IO for potential real-time updates (implementation details not fully shown).
* **Modern UI:** Built with Tailwind CSS and Shadcn UI components.

## Tech Stack

* **Framework:** Next.js (v15+) - App Router
* **Language:** TypeScript
* **Styling:** Tailwind CSS, Shadcn UI
* **Frontend:** React (v19+)
* **State Management:** React Context API (`context/wallet-context.tsx`)
* **Blockchain Interaction:** Ethers.js (v6+)
* **Database:** MongoDB
* **ODM:** Mongoose
* **Backend API:** Next.js API Routes
* **Package Manager:** PNPM

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js (v18.18 or later recommended for Next.js 15)
* PNPM (Package manager)
* MongoDB instance (local or cloud like MongoDB Atlas)
* MetaMask browser extension (or another compatible wallet)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/wisky7206/MEDX-Blockchain-powered-supply-chain.git](https://github.com/wisky7206/MEDX-Blockchain-powered-supply-chain.git)
    cd MEDX-Blockchain-powered-supply-chain
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up Environment Variables:**
    * Create a file named `.env.local` in the project root.
    * Add the necessary environment variables. You'll need at least:
        ```dotenv
        MONGODB_URI=your_mongodb_connection_string

        # Get this after deploying your MedXSupplyChain contract
        NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address

        # Add any other variables needed (e.g., for authentication, APIs)
        ```
    * Replace `your_mongodb_connection_string` and `your_deployed_contract_address` with your actual values.

4.  **Deploy Smart Contract (If not already done):**
    * You need to deploy the `MedXSupplyChain.sol` contract (presumably located in a `contracts` directory, though not fully shown in the provided files) to a compatible blockchain (e.g., a local testnet like Hardhat Network, or a public testnet like Sepolia).
    * Update the `NEXT_PUBLIC_CONTRACT_ADDRESS` in your `.env.local` file with the deployed contract's address.

### Running the Development Server

1.  **Start the Next.js development server:**
    ```bash
    pnpm dev
    ```

2.  Open [http://localhost:3000](http://localhost:3000) (or the specified port) in your browser.

## Usage

1.  **Connect Wallet:** Use the "Connect Wallet" button to connect your MetaMask wallet. Ensure your wallet is connected to the same network where the smart contract is deployed.
2.  **Registration:** If your connected wallet address is not registered in the database, you will likely be prompted to select a role and register.
3.  **Dashboard:** Once connected and registered, you will be directed to your role-specific dashboard.
4.  **Navigate:** Use the sidebar or navigation links to access different sections like Inventory, Orders, Tracking, Profile, and Settings.
5.  **Interact:** Perform actions relevant to your role, such as adding inventory, creating orders (which will interact with both the database and the blockchain), viewing tracking history, etc.

## Project Structure (Simplified)
├── app/                      # Next.js App Router pages and layouts
│   ├── api/                  # Backend API routes
│   ├── dashboard/            # Role-based dashboard pages
│   │   ├── [role]/           # Dynamic route for roles
│   │   │   ├── inventory/
│   │   │   ├── orders/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   ├── tracking/
│   │   │   └── page.tsx      # Main dashboard page
│   │   └── layout.tsx        # Dashboard layout component
│   ├── auth/                 # Authentication pages (login, role selection)
│   └── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/               # Reusable React components
│   ├── ui/                   # Shadcn UI components
│   └── dashboard-layout.tsx  # Custom layout component
├── context/                  # React Context providers (e.g., wallet-context.tsx)
├── contracts/                # Solidity smart contracts (e.g., MedXSupplyChain.json ABI)
├── hooks/                    # Custom React hooks (e.g., use-toast.ts)
├── lib/                      # Utility functions, libraries, config (db, contract, utils)
├── models/                   # Mongoose schemas/models (User, Product, Order)
├── public/                   # Static assets
├── styles/                   # Additional styles
├── .env.local                # Local environment variables (ignored by git)
├── .gitignore                # Files/folders ignored by git
├── next.config.mjs           # Next.js configuration
├── package.json              # Project dependencies and scripts
├── pnpm-lock.yaml            # PNPM lockfile
└── tsconfig.json             # TypeScript configuration
