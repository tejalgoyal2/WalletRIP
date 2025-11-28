import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'WalletRIP Dashboard'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(to bottom, #111, #333)',
                    color: 'white',
                }}
            >
                <div
                    style={{
                        fontSize: 64,
                        fontWeight: 'bold',
                        marginBottom: 20,
                    }}
                >
                    WalletRIP 💸
                </div>
                <div
                    style={{
                        fontSize: 32,
                        color: '#ccc',
                    }}
                >
                    The AI expense tracker that roasts you.
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
