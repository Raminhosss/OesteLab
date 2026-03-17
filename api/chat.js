export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt + "\n\nPergunta do Cliente: " + message }] }
        ]
      })
    });

    const data = await response.json();
    const botReply = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ reply: botReply });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao comunicar com a IA.' });
  }
}