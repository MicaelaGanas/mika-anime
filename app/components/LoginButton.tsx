'use client'

export default function LoginButton() {
  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_MANGADEX_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
    );
    
    const authUrl = `https://auth.mangadex.org/realms/mangadex/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid`;
    
    window.location.href = authUrl;
  };

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 bg-[#2bd5d5] text-black rounded font-semibold hover:bg-[#19bfbf] transition-colors"
    >
      Login with MangaDex
    </button>
  );
}
