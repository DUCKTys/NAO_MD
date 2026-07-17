import fetch from "node-fetch"
import FormData from "form-data"
import axios from "axios"


//=================================
// UGUU UPLOADER
//=================================

async function uploadUguu(buffer) {

    try {

        const form = new FormData()

        form.append(
            "files[]",
            buffer,
            `${Date.now()}.jpg`
        )

        const res = await axios.post(
            "https://uguu.se/upload",
            form,
            {
                headers: {
                    ...form.getHeaders()
                }
            }
        )

        const url =
            res.data?.files?.[0]?.url

        console.log(
            "UGUU :",
            url
        )

        if (!url)
            throw new Error(
                "Upload gagal."
            )

        return url

    } catch (e) {

        throw new Error(
            "UGUU Error : " +
            e.message
        )

    }

}


//=================================
// ALWAYS CODEX
//=================================

async function upscaleAlwaysCodex(
    imageUrl
) {

    const api =

`https://api.alwayscodex.my.id/api/imagehd/ai-enhancev2?url=${encodeURIComponent(imageUrl)}&size=4`


    const res =
        await fetch(api)


    const type =
        res.headers.get(
            "content-type"
        ) || ""


    console.log(
        "Content Type :",
        type
    )


    //=================
    // IMAGE
    //=================

    if (
        type.includes(
            "image"
        )
    ) {

        const buffer =
            Buffer.from(

                await res.arrayBuffer()

            )


        return {

            type :
            "buffer",

            data :
            buffer

        }

    }



    //=================
    // JSON
    //=================

    if (
        type.includes(
            "json"
        )
    ) {

        const json =
            await res.json()


        const url =

            json.data?.url ||

            json.result ||

            json.url ||

            json.image ||

            null


        if (!url)
            throw new Error(

                json.message ||

                "Upscale gagal."

            )


        return {

            type :
            "url",

            data :
            url

        }

    }


    throw new Error(

        "Response API tidak diketahui."

    )

}



//=================================
// PIXELCUT
//=================================

async function upscalePixelcut(
    media,
    mime
) {

    const ext =
        mime.split("/")[1]


    const form =
        new FormData()


    form.append(
        "image",
        media,
        {

            filename :
            `upscale.${ext}`,

            contentType :
            mime

        }
    )


    form.append(
        "scale",
        "2"
    )


    const res =
        await fetch(

            "https://api2.pixelcut.app/image/upscale/v1",

            {

                method :
                "POST",

                headers : {

                    ...form.getHeaders(),

                    accept :
                    "application/json",

                    "x-client-version" :
                    "web",

                    "x-locale" :
                    "en"

                },

                body :
                form

            }

        )


    const text =
        await res.text()


    console.log(
        "Pixelcut :",
        text
    )


    const json =
        JSON.parse(text)


    if (
        !json.result_url
    )

        throw new Error(
            "Upscale gagal."
        )


    return (
        json.result_url
    )

}



//=================================
// COMMAND
//=================================

export const run = {

    cmd : [
        "hd",
        "upscale",
        "remini"
    ],

    category :
    "tools",

    description :
    "Upscale Image HD",



    run : async (
        m,
        { sock }
    ) => {

        const quoted =

            m.quoted ?
            m.quoted :
            m


        const mime =

            quoted.mimetype ||

            quoted.msg?.mimetype ||

            ""


        if (

            !/image\/(jpeg|jpg|png)/i

            .test(mime)

        )

        return m.reply(

            "Reply gambar dengan command *.hd*"

        )


        try {

            m.react(
                config.emoji
            )


            const media =
                await quoted.download()



            //=================
            // ALWAYS CODEX
            //=================

            try {

                const imageUrl =

                    await uploadUguu(
                        media
                    )


                const result =

                    await upscaleAlwaysCodex(
                        imageUrl
                    )


                //BUFFER

                if (

                    result.type ===
                    "buffer"

                ) {

                    return await m.reply({

                        image :
                        result.data,

                        caption :

`✨ *Upscale Berhasil*

• Engine : AlwaysCodex AI
• Scale : 4x`

                    })

                }


                //URL

                if (

                    result.type ===
                    "url"

                ) {

                    return await m.reply({

                        image : {

                            url :
                            result.data

                        },

                        caption :

`✨ *Upscale Berhasil*

• Engine : AlwaysCodex AI
• Scale : 4x`

                    })

                }


            } catch (e) {

                console.log(

                    "AlwaysCodex Error :",

                    e.message

                )

            }



            //=================
            // PIXELCUT
            //=================

            try {

                const result =

                    await upscalePixelcut(
                        media,
                        mime
                    )


                return await m.reply({

                    image : {

                        url :
                        result

                    },

                    caption :

`✨ *Upscale Berhasil*

• Engine : Pixelcut AI
• Scale : 2x`

                })


            } catch (e) {

                console.log(

                    "Pixelcut Error :",

                    e.message

                )

            }



            //=================
            // ERROR
            //=================

            return m.reply(

`❌ Semua server sedang bermasalah.

Silahkan coba beberapa saat lagi.`

            )


        } catch (e) {

            console.log(e)

            return m.reply(
                e.message
            )

        }

    }

}
