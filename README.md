<div align="center">
  <img src="public/cat.ico" alt="NyaaReads Logo" width="100" height="100">
  
  # 🐱 NyaaReads
  
  ### A Privacy-First Manga Reading Platform
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2.3-blue)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
  
  [Features](#features) • [Installation](#installation) • [Deployment](#deployment) • [Tech Stack](#tech-stack) • [Contributing](#contributing)
  
</div>

---

## 📖 About

**NyaaReads** is a modern, privacy-focused manga reading platform that integrates with the MangaDex API to provide a seamless reading experience. Built with Next.js and React, it offers a clean, responsive interface with zero data collection - everything stays on your device.

> **Important**: NyaaReads is a self-hosted application. You need to deploy your own instance to use it. The project scrapes data from MangaDex and other sources through proxy endpoints.

> **Caution**: NyaaReads is not affiliated with MangaDex or any content providers. This project is for educational purposes. Users are responsible for ensuring compliance with local laws and provider terms of service.

---

## ✨ Features

- 🔍 **Advanced Search** - Search thousands of manga titles with real-time results
- 📚 **Smart Library** - Browse by Popular, Latest, and custom categories
- 🔖 **Local Bookmarks** - Save favorites with browser-based storage (no account needed)
- 📖 **Optimized Reader** - Smooth reading experience with lazy loading and image proxying
- 🎨 **Modern UI** - Clean, responsive design with dark mode support
- 🔒 **Privacy First** - No tracking, no cookies, no data collection
- 🚀 **Fast Performance** - Built with Next.js 16 for optimal speed
- 📱 **Mobile Friendly** - Fully responsive design for all devices
- 🌐 **API Proxy** - Built-in image and data proxying to avoid CORS issues

---

## 🚀 Installation

### Prerequisites

- Node.js 20.x or higher
- npm, yarn, pnpm, or bun

### Locally

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/nyaareads.git
cd nyaareads
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

For production:

```bash
npm run build
npm start
```

### 🐳 Docker

Build and run with Docker:

```bash
docker build -t nyaareads .
docker run -p 3000:3000 nyaareads
```

Or use Docker Compose:

```bash
docker-compose up -d
```

---

## ☁️ Deployment

### Vercel

Deploy instantly to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/nyaareads)

1. Click the button above
2. Import your repository
3. Deploy!

### Netlify

```bash
npm run build
```

Then deploy the `.next` folder to Netlify.

### Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

### Render

1. Create a new Web Service
2. Connect your repository
3. Build command: `npm install && npm run build`
4. Start command: `npm start`

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) - React framework with App Router
- **UI Library**: [React 19](https://reactjs.org/) - Component-based UI
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/) - Utility-first CSS
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) - Type-safe development
- **Data Source**: [MangaDex API](https://api.mangadex.org/docs/) - Manga metadata and images
- **Storage**: Browser LocalStorage - Client-side bookmark persistence

---

## 📁 Project Structure

```
nyaareads/
├── app/
│   ├── api/                  # API routes (proxies)
│   │   ├── cover/           # Cover image proxy
│   │   ├── manga/           # Manga data proxy
│   │   ├── chapter/         # Chapter data & reading
│   │   └── proxy-image/     # General image proxy
│   ├── components/          # React components
│   │   ├── Header.tsx       # Navigation bar
│   │   ├── Footer.tsx       # Site footer
│   │   ├── home-new.tsx     # Home page
│   │   ├── browse.tsx       # Browse/trending
│   │   ├── library.tsx      # Library pages
│   │   ├── series.tsx       # Series details
│   │   ├── reader.tsx       # Chapter reader
│   │   └── ...
│   ├── lib/                 # Utilities
│   │   └── fetchCache.ts    # API caching layer
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Entry point
│   └── globals.css          # Global styles
├── public/                  # Static assets
│   └── cat.ico             # Site icon
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript config
└── package.json            # Dependencies
```

---

## 🎨 Features Breakdown

### Home Page
- Hero banner with search
- Trending manga sidebar
- Popular/Latest manga sections
- Quick navigation

### Library
- Filter by Popular, Latest, or Browse all
- Infinite scroll with "Load More"
- Grid layout with cover images
- Real-time search filtering

### Series Page
- Cover art and metadata
- Chapter list with sorting
- Follow/bookmark functionality
- Author and artist information
- Genre tags

### Reader
- Clean reading interface
- Page-by-page navigation
- Lazy loading for performance
- Progress tracking
- Next/previous chapter navigation

### Privacy Features
- No user accounts required
- No server-side data collection
- All bookmarks stored locally
- No tracking or analytics
- No third-party cookies

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file (optional):

```env
# No environment variables required for basic usage
# All API calls are proxied through Next.js API routes
```

### Customization

- **Theme Colors**: Edit [app/globals.css](app/globals.css) to change the aquamarine color scheme
- **API Endpoints**: Modify routes in [app/api/](app/api/) to change data sources
- **Components**: Customize UI in [app/components/](app/components/)

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature idea?

- **Bug Reports**: [Create an issue](https://github.com/yourusername/nyaareads/issues) with the `bug` label
- **Feature Requests**: [Create an issue](https://github.com/yourusername/nyaareads/issues) with the `enhancement` label
- **Questions**: Join our [Discord server](https://discord.gg/yourinvite) (if available)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

**NyaaReads** is an independent project and is **not affiliated with, endorsed by, or connected to MangaDex** or any manga publishers/creators.

- This application is intended for **educational and personal use only**
- Users are responsible for ensuring their use complies with local laws and regulations
- All manga content is sourced from MangaDex's public API
- Respect copyright and support official releases when possible

---

## 🙏 Acknowledgments

- [MangaDex](https://mangadex.org/) - For providing the public API
- [Next.js](https://nextjs.org/) - Amazing React framework
- [TailwindCSS](https://tailwindcss.com/) - For the utility-first CSS framework
- All contributors and users of NyaaReads

---

## 📞 Support

Need help? Here's how to reach us:

- 📧 Email: your-email@example.com
- 💬 Discord: [Join our server](https://discord.gg/yourinvite)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/nyaareads/issues)

---

<div align="center">
  
  ### Made with 💙 by the NyaaReads Team
  
  **If you like this project, please consider giving it a ⭐!**
  
  [Website](https://nyaareads.com) • [Documentation](https://docs.nyaareads.com) • [Discord](https://discord.gg/yourinvite)
  
</div>
