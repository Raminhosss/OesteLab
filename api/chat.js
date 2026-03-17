export default async function handler(req, res) {
  // 1. Permite que o Vercel comunique corretamente (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

  if (req.method === 'OPTIONS') { return res.status(200).end(); }
  if (req.method !== 'POST') { return res.status(405).json({ error: 'Método não permitido' }); }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // 2. Verifica se o Vercel encontrou a chave
  if (!apiKey) {
    return res.status(500).json({ error: 'Vercel não encontrou a chave GEMINI_API_KEY.' });
  }

  // Personalidade da OesteLab
  const systemPrompt = `
    És o assistente virtual da OesteLab, uma agência de Web Design de Torres Vedras dirigida pelo João e pelo Martim.
    A tua personalidade: Simpático, profissional, direto e focado em resultados.
    Crença principal: Um site não deve ser apenas bonito, deve ser RÁPIDO e converter visitantes em clientes.
    Serviços: Sites One-Page (250€-350€), Multi-Página (500€-800€) e Gestão de Redes Sociais.
    Objetivo: Responder a dúvidas e convencer o cliente a pedir um orçamento.
    Call to Action Final: Deves sempre sugerir que enviem mensagem para o Instagram (@_oestelab_) ou usem a página de contactos do site.
    Instrução: Responde sempre em Português de Portugal e de forma concisa.
  `;

  try {
    // A MÁGICA ESTÁ AQUI: Atualizado para o novo e mais rápido modelo gemini-2.5-flash!
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + "\n\nCliente: " + message }] }]
      })
    });

    const data = await response.json();

    // 3. Apanha erros enviados pela própria Google
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