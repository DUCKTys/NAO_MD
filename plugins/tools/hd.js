import fetch from "node-fetch"
import FormData from "form-data"

export const run = {
    cmd: ["upscale", "hd", "remini"],
    category: "tools",
    description: "Upscale image menggunakan Pixelcut",

    run: async (m, { sock }) => {

        const quoted = m.quoted ? m.quoted : m

        const mime = quoted.mimetype || quoted.msg?.mimetype || ""

        if (!/image\/(jpeg|jpg|png)/i.test(mime))
            return m.reply("Reply gambar dengan command *.upscale*")

        try {

            m.react(config.emoji)

            const media = await quoted.download()

            const ext = mime.split("/")[1]

            const form = new FormData()

            form.append("image", media, {
                filename: `upscaled.${ext}`,
                contentType: mime
            })

            form.append("scale", "2")

            const res = await fetch(
                "https://api2.pixelcut.app/image/upscale/v1",
                {
                    method: "POST",
                    headers: {
                        ...form.getHeaders(),
                        accept: "application/json",
                        "x-client-version": "web",
                        "x-locale": "en"
                    },
                    body: form
                }
            )

            const json = await res.json()

            if (!json.result_url)
                return m.reply("Upscale gagal.")

            await m.reply({
                image: {
                    url: json.result_url
                },
                caption:
`✨ *Upscale Berhasil*

• Scale : 2x
• Engine : Pixelcut AI`
            })

        } catch (e) {

            console.log(e)

            m.reply(e.message)

        }

    }

}