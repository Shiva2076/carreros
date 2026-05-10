import Groq from 'groq-sdk'

let _groq: Groq | null = null
function getGroq() {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return _groq
}

export async function generateCoverLetter(jdText: string) {
  const completion = await getGroq().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an expert career coach. Write a concise, personalized cover letter for a full-stack developer with expertise in Node.js, React, MongoDB, AWS, and IoT systems. Tone: confident, human, not salesy. Max 250 words. Return only the cover letter text, no subject line.`,
      },
      {
        role: 'user',
        content: `Job description:\n${jdText}\n\nWrite the cover letter.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  })
  return {
    text: completion.choices[0].message.content ?? '',
    tokensUsed: completion.usage?.total_tokens ?? 0,
  }
}

export async function scoreJobMatch(jdText: string) {
  const completion = await getGroq().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a technical recruiter. Score how well this job description matches a full-stack developer with expertise in Node.js, React, MongoDB, TypeScript, AWS, and IoT systems. Return ONLY a JSON object: {"score": <0-100>, "reason": "<one sentence>"}`,
      },
      {
        role: 'user',
        content: `Job description:\n${jdText}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 150,
  })

  try {
    const raw = completion.choices[0].message.content ?? '{}'
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
    return { score: parsed.score ?? 0, tokensUsed: completion.usage?.total_tokens ?? 0 }
  } catch {
    return { score: 0, tokensUsed: completion.usage?.total_tokens ?? 0 }
  }
}

export async function generateWeeklyDigest(stats: object) {
  const completion = await getGroq().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content:
          'You are a friendly career advisor. Write a concise weekly summary in 3-4 sentences based on these stats. Be encouraging but honest. Highlight the most important action item.',
      },
      { role: 'user', content: JSON.stringify(stats) },
    ],
    temperature: 0.6,
    max_tokens: 200,
  })
  return completion.choices[0].message.content ?? ''
}
