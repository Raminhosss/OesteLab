export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

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
    
    // Verificação de segurança para evitar o Erro 500
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      const botReply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: botReply });
    } else {
      throw new Error("Resposta inválida da API Gemini");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor de chat.' });
  }
}