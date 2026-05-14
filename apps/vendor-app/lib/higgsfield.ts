// Higgsfield AI — image-to-video generation service
// Docs: https://docs.higgsfield.ai
// Env: EXPO_PUBLIC_HIGGSFIELD_API_KEY (set in .env or Vercel env)

const BASE_URL = 'https://api.higgsfield.ai'
const API_KEY = process.env.EXPO_PUBLIC_HIGGSFIELD_API_KEY ?? ''

const POLL_INTERVAL_MS = 5_000
const MAX_WAIT_MS = 90_000 // 90 seconds

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

interface GenerateResponse {
  id: string
  status: string
}

interface StatusResponse {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'succeeded' | 'failed'
  output?: { video_url?: string }
  video?: { url?: string }
  video_url?: string
}

/**
 * Generates a verification video for a product using its uploaded photo URLs.
 * Returns the public video URL on success.
 * Throws on timeout or API failure.
 *
 * Set EXPO_PUBLIC_HIGGSFIELD_API_KEY in your .env to enable this integration.
 */
export async function generateVerificationVideo(photoUrls: string[]): Promise<string> {
  if (!API_KEY) {
    throw new Error('Higgsfield API key not configured. Set EXPO_PUBLIC_HIGGSFIELD_API_KEY.')
  }
  if (photoUrls.length === 0) {
    throw new Error('At least one photo URL is required for video generation.')
  }

  // Step 1: Create generation job
  const createRes = await fetch(`${BASE_URL}/v1/generation/image-to-video`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Primary image drives the animation
      image_url: photoUrls[0],
      // Optional secondary frames for richer context
      ...(photoUrls[1] ? { reference_images: photoUrls.slice(1, 3) } : {}),
    }),
  })

  if (!createRes.ok) {
    const body = await createRes.json().catch(() => ({}))
    throw new Error(body?.message ?? `Generation failed (${createRes.status})`)
  }

  const { id }: GenerateResponse = await createRes.json()

  // Step 2: Poll until complete or timeout
  const deadline = Date.now() + MAX_WAIT_MS

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS)

    const pollRes = await fetch(`${BASE_URL}/v1/generation/${id}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })

    if (!pollRes.ok) continue

    const data: StatusResponse = await pollRes.json()

    if (data.status === 'completed' || data.status === 'succeeded') {
      const url =
        data.output?.video_url ??
        data.video?.url ??
        data.video_url

      if (url) return url
      throw new Error('Video generation completed but no URL returned.')
    }

    if (data.status === 'failed') {
      throw new Error('Video generation failed on Higgsfield servers.')
    }
    // 'pending' | 'processing' → keep polling
  }

  throw new Error('Video generation timed out after 90 seconds.')
}
