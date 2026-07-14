import fs from 'node:fs'
import Crypto from 'crypto'
import ff from 'fluent-ffmpeg'
import webp from 'node-webpmux'
import path from 'node:path'
import { fileTypeFromBuffer } from 'file-type'

const temp = '.tmp'

if (!fs.existsSync(temp)) {
    fs.mkdirSync(temp, { recursive: true })
}

function randomName(ext) {
    return path.join(temp, `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`)
}

async function imageToWebp(media) {
    const input = randomName('tmp')
    const output = randomName('webp')

    fs.writeFileSync(input, media.data)

    try {
        await new Promise((resolve, reject) => {
            ff(input)
                .on('error', reject)
                .on('end', resolve)
                .addOutputOptions([
                    '-vcodec',
                    'libwebp',
                    '-lossless',
                    '1',
                    '-qscale',
                    '1',
                    '-preset',
                    'picture',
                    '-pix_fmt',
                    'yuva420p',
                    '-vf',
                    'scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000'
                ])
                .toFormat('webp')
                .save(output)
        })

        const buffer = fs.readFileSync(output)

        await fs.promises.unlink(input).catch(() => {})
        await fs.promises.unlink(output).catch(() => {})

        return buffer
    } catch (e) {
        await fs.promises.unlink(input).catch(() => {})
        await fs.promises.unlink(output).catch(() => {})
        throw e
    }
}

async function videoToWebp(media) {
    const input = randomName('tmp')
    const output = randomName('webp')

    fs.writeFileSync(input, media.data)

    try {
        await new Promise((resolve, reject) => {
            ff(input)
                .on('error', reject)
                .on('end', resolve)
                .addOutputOptions([
                    '-vcodec',
                    'libwebp',
                    '-lossless',
                    '1',
                    '-qscale',
                    '1',
                    '-preset',
                    'picture',
                    '-pix_fmt',
                    'yuva420p',
                    '-loop',
                    '0',
                    '-ss',
                    '00:00:00',
                    '-t',
                    '00:00:05',
                    '-an',
                    '-vsync',
                    '0',
                    '-vf',
                    'fps=15,split[bg][fg];[bg]scale=512:512,boxblur=20:1[bb];[fg]scale=512:512:force_original_aspect_ratio=decrease[ffg];[bb][ffg]overlay=(W-w)/2:(H-h)/2'
                ])
                .toFormat('webp')
                .save(output)
        })

        const buffer = fs.readFileSync(output)

        await fs.promises.unlink(input).catch(() => {})
        await fs.promises.unlink(output).catch(() => {})

        return buffer
    } catch (e) {
        await fs.promises.unlink(input).catch(() => {})
        await fs.promises.unlink(output).catch(() => {})
        throw e
    }
}

export async function exif(media, metadata = {}) {
    const buffer = Buffer.isBuffer(media)
        ? media
        : media instanceof Uint8Array
        ? Buffer.from(media)
        : media?.data

    if (!buffer) return null

    let mimetype

    if (Buffer.isBuffer(media) || media instanceof Uint8Array) {
        const type = await fileTypeFromBuffer(buffer)
        mimetype = type?.mime
    } else {
        mimetype = media.mimetype
    }

    if (!mimetype) return null

    const wMedia = /webp/.test(mimetype)
        ? buffer
        : /image/.test(mimetype)
        ? await imageToWebp({ data: buffer })
        : /video/.test(mimetype)
        ? await videoToWebp({ data: buffer })
        : null

    if (!wMedia) return null

    const img = new webp.Image()

    const json = {
        'sticker-pack-id': metadata.packId || `${Date.now()}`,
        'sticker-pack-name': metadata.packName || '',
        'sticker-pack-publisher': metadata.packPublish || '',
        'android-app-store-link': metadata.androidApp || 'https://play.google.com/store/apps/details?id=com.mobile.legends',
        'ios-app-store-link': metadata.iOSApp || 'https://apps.apple.com/app/id544007664',
        emojis: metadata.emojis || ['😋', '😎', '🤣', '😂', '😁'],
        'is-avatar-sticker': metadata.isAvatar || 0
    }

    const exifAttr = Buffer.from([
        0x49,
        0x49,
        0x2A,
        0x00,
        0x08,
        0x00,
        0x00,
        0x00,
        0x01,
        0x00,
        0x41,
        0x57,
        0x07,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x16,
        0x00,
        0x00,
        0x00
    ])

    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
    const exifBuffer = Buffer.concat([exifAttr, jsonBuffer])

    exifBuffer.writeUIntLE(jsonBuffer.length, 14, 4)

    await img.load(wMedia)
    img.exif = exifBuffer

    return await img.save(null)
}