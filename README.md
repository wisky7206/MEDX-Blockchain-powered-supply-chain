# MedX - Blockchain Supply Chain Management

A blockchain-based supply chain management system built with Next.js, MongoDB, and Web3 technologies.

## Features

- Wallet Authentication
- Role-based Access Control
- Inventory Management
- Supply Chain Tracking
- Real-time Updates
- Blockchain Verification

## Tech Stack

- **Frontend:** Next.js 14, React 18, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** MongoDB Atlas
- **Blockchain:** Ethereum (Web3)
- **Authentication:** Wallet Connect

## Prerequisites

- Node.js 18+ 
- MongoDB Atlas Account
- MetaMask or any Web3 Wallet
- Yarn/NPM

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/medx.git
cd medx
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

The project is set up to be deployed on Vercel:

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add environment variables in Vercel project settings
4. Deploy!

## Project Structure

```
medx/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Dashboard pages
├── components/            # React components
├── context/              # React context providers
├── lib/                  # Utility functions and configurations
└── public/              # Static files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


