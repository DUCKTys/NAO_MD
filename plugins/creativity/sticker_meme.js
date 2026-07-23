import { Sticker } from "wa-sticker-formatter";

export const run = {
  cmd: ["stickermeme", "smeme", "stikermeme"],
  category: "maker",
  description: "Membuat sticker meme dengan teks atas dan bawah",

  run: async (m, { sock, text, Func, config }) => {
    if (!text) {
      return m.reply(
        `Contoh penggunaan:\n.smeme get in the fucking robot|shinji!`
      );
    }

    const quoted = m.quoted ? m.quoted : m;
    const mime = quoted.mime || "";

    if (!/image|webp/.test(mime)) {
      return m.reply(
        "Reply/kirim gambar atau sticker dengan caption:\n.smeme teks atas|teks bawah"
      );
    }

    try {
      const media = await quoted.download();
      const uploadUrl = await Func.upload.telegra(media);

      let [top, bottom] = text.split("|").map(v => v.trim());

      if (bottom) {
        top = top || " ";
      } else {
        bottom = top || " ";
        top = " ";
      }

      const url = `https://api.nexray.my.id/maker/smeme?text_atas=${encodeURIComponent(top)}&text_bawah=${encodeURIComponent(bottom)}&background=${encodeURIComponent(uploadUrl)}`;

      await sock.sendMessage(
        m.chat,
        {
          sticker: { url }
        },
        {
          quoted: m
        }
      );

    } catch (e) {
      console.error(e);
      m.reply("Gagal membuat sticker meme.");
    }
  }
};
