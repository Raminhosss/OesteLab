export default async function handler(req, res) {
  // 1. Permite que o Vercel comunique corretamente (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

  if (req.method === 'OPTIONS') { return res.status(200).end(); }
  if (req.method !== 'POST') { return res.status(405).json({ error: 'Método não permitido' }); }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // 2. Verifica logo se o Vercel encontrou a chave
  if (!apiKey) {
    return res.status(500).json({ error: 'Vercel não encontrou a chave GEMINI_API_KEY. Confirme as variáveis de ambiente.' });
  }

  const systemPrompt = "És o assistente da OesteLab em Torres Vedras. Responde de forma curta e profissional.";

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + "\n\nCliente: " + message }] }]
      })
    });

    const data = await response.json();

    // 3. Apanha erros enviados pela própria Google (Ex: chave inválida, quota excedida)
    if (!response.ok) {
      return res.status(500).json({ error: `Recusado pela Google: ${data.error?.message || 'Erro Desconhecido'}` });
    }

    if (data.candidates && data.candidates[0].content) {
      return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      return res.status(500).json({ error: 'A Google respondeu, mas não enviou texto.' });
    }

  } catch (error) {
    return res.status(500).json({ error: `O Servidor Vercel falhou: ${error.message}` });
  }
}