import Replicate from "replicate";

export const chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;
    const sentraprompt = process.env.SENTRA;

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(
      "ibm-granite/granite-3.3-8b-instruct", 
      {
        input: {
          prompt: `${sentraprompt}\n\nPertanyaan: ${message}`,
          max_tokens: 800,
          temperature: 0.7,
          top_p: 0.8,
          top_k: 40,
        },
      }
    );

    const reply = Array.isArray(output)
      ? output.join("")
      : output || "Tidak ada jawaban yang tersedia";

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
          if (colors.length > 0) return colors;
        }
      }
      const allHex = text.match(/#[0-9A-Fa-f]{6}/gi);
      return allHex ? [...new Set(allHex)].slice(0, 5) : [];
    };

    const colors = extractColors(reply);
    const cleanReply = reply.replace(/\*\*WARNA_PALETTE:\*\*\s*[#\w\s,]+/gi, "").trim();

    res.json({
      reply: cleanReply,
      colors: colors.length > 0 ? colors : null,
    });
  } catch (err) {
    console.error("Granite error:", err);
    res.status(500).json({ error: "Gagal memproses permintaan" });
  }
};