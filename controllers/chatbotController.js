
export const chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;
    const sentraprompt = process.env.SENTRA;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${sentraprompt}\n\nPertanyaan: ${message}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          topP: 0.8,
          topK: 40
        }
      })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tidak ada jawaban yang tersedia';

    const extractColors = (text) => {
      const patterns = [
        /\*\*WARNA_PALETTE:\*\*\s*([#\w\s,]+)/i,
        /WARNA_PALETTE:\s*([#\w\s,]+)/i,
        /\*\*WARNA_PALETTE:\*\*\s*\[([^\]]+)\]/i
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          const colorsString = match[1];
          const colors = colorsString
            .split(',')
            .map(color => color.trim().replace(/[\[\]"']/g, ''))
            .filter(color => /^#[0-9A-Fa-f]{6}$/i.test(color));
          
          if (colors.length > 0) {
            return colors;
          }
        }
      }
      
      const hexPattern = /#[0-9A-Fa-f]{6}/gi;
      const allHexColors = text.match(hexPattern);
      
      if (allHexColors) {
        return [...new Set(allHexColors)].slice(0, 5);
      }
      
      return [];
    };

    const colors = extractColors(reply);
    const cleanReply = reply.replace(/\*\*WARNA_PALETTE:\*\*\s*[#\w\s,]+/gi, '').trim();

    res.json({ 
      reply: cleanReply,
      colors: colors.length > 0 ? colors : null
    });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'Gagal memproses permintaan' });
  }
};