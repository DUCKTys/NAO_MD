import crypto from "crypto"

async function hdvideo(buffer) {
    const baseApi = "https://api.unblurimage.ai"
    const productSerial = crypto.randomUUID().replace(/-/g, "")

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    async function jsonFetch(url, options = {}) {
        const res = await fetch(url, options)
        const text = await res.text()

        let json

        try {
            json = JSON.parse(text)
        } catch {
            throw new Error(text)
        }

        if (!res.ok) throw new Error(json?.message || "Request gagal")

        return json
    }

    const uploadForm = new FormData()
    uploadForm.set("video_file_name", `video-${Date.now()}.mp4`)

    const upload = await jsonFetch(
        `${baseApi}/api/upscaler/v1/ai-video-enhancer/upload-video`,
        {
            method: "POST",
            body: uploadForm
        }
    )

    if (upload.code !== 100000)
        throw new Error("Upload gagal")

    const { url, object_name } = upload.result

    const put = await fetch(url, {
        method: "PUT",
        headers: {
            "content-type": "video/mp4"
        },
        body: buffer
    })

    if (!put.ok)
        throw new Error("Upload video gagal")

    const cdn = `https://cdn.unblurimage.ai/${object_name}`

    const form = new FormData()

    form.set("original_video_file", cdn)
    form.set("resolution", "2k")
    form.set("is_preview", "false")

    const create = await jsonFetch(
        `${baseApi}/api/upscaler/v2/ai-video-enhancer/create-job`,
        {
            method: "POST",
            headers: {
                "product-serial": productSerial,
                authorization: ""
            },
            body: form
        }
    )

    if (create.code !== 100000)
        throw new Error("Create Job gagal")

    const jobId = create.result.job_id

    if (!jobId)
        throw new Error("Job ID tidak ditemukan")

    while (true) {

        await sleep(10000)

        const job = await jsonFetch(
            `${baseApi}/api/upscaler/v2/ai-video-enhancer/get-job/${jobId}`,
            {
                headers: {
                    "product-serial": productSerial,
                    authorization: ""
                }
            }
        )

        if (job.code !== 100000)
            continue

        if (job.result.output_url)
            return job.result.output_url
    }
}

export const run = {
    cmd: ["hdvid", "hdvideo"],
    category: "tools",
    description: "HD Video AI",

    run: async (m) => {

        const q = m.quoted ? m.quoted : m

        const mime = q.mimetype || q.msg?.mimetype || ""

        if (!mime.startsWith("video/"))
            //return m.reply("Reply video dengan command *.hdvid*")

        m.react("⏳")

        try {

            const buffer = await q.download()

            const url = await hdvideo(buffer)

            await m.reply(
`✨ *HD Video Berhasil Dibuat!*

Silakan download hasilnya melalui link berikut:

${url}

_Link akan tetap aktif selama masih tersedia di server UnblurImage AI._`
            )

            m.react("✅")

        } catch (e) {

            console.error(e)

            m.react("❌")

            m.reply(e.message)

        }

    }
}