import {
    generateWAMessageFromContent,
    generateWAMessage
} from 'baileys';
import {
    fileTypeFromBuffer
} from 'file-type';
import {
    exif
} from './exif.js';

export const bindSocket = (sock) => {

    sock.sendSticker = async (jid, media, options = {}) => {
        try {
            const metadata = {
                packName: options.packname || "",
                packPublish: options.author || ""
            };

            const sendOptions = {
                ...options
            };
            const isAi = sendOptions.ai;

            delete sendOptions.packname;
            delete sendOptions.author;
            delete sendOptions.ai;

            const stickerBuffer = await exif(media, metadata);
            if (!stickerBuffer) {
                throw new Error("Gagal mengonversi media menjadi stiker WebP.");
            }

            const messageContent = {
                sticker: stickerBuffer
            };

            if (isAi) {
                messageContent.isAiSticker = true;
            }

            return await sock.sendMessage(
                jid,
                messageContent,
                sendOptions
            );
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    sock.sendContact = async (jid, contacts = [], options = {}) => {
        if (!Array.isArray(contacts)) contacts = [contacts]

        return sock.sendMessage(
            jid, {
                contacts: {
                    displayName: contacts.length === 1 ?
                        (contacts[0].name || contacts[0].number) : `${contacts.length} Contacts`,
                    contacts: contacts.map(({
                        name,
                        number
                    }) => {
                        number = String(number).replace(/\D/g, '')
                        return {
                            displayName: name || number,
                            vcard: `BEGIN:VCARD
VERSION:3.0
FN:${name || number}
TEL;type=CELL;type=VOICE;waid=${number}:${number}
END:VCARD`
                        }
                    })
                }
            },
            options
        )
    }

    sock.sendAlbum = async (jid, medias = [], options = {}) => {
        if (!Array.isArray(medias) || medias.length < 2) {
            throw new Error('Album minimal berisi 2 media.');
        }

        const mediaObj = [];

        for (const item of medias) {
            let buffer;
            let caption = '';

            try {
                if (typeof item === 'string') {
                    const res = await fetch(item);
                    if (!res.ok) continue;
                    buffer = Buffer.from(await res.arrayBuffer());
                } else if (typeof item === 'object') {
                    caption = item.caption || '';
                    if (item.url) {
                        const res = await fetch(item.url);
                        if (!res.ok) continue;
                        buffer = Buffer.from(await res.arrayBuffer());
                    } else if (item.image || item.video || item.buffer) {
                        buffer = item.image || item.video || item.buffer;
                    }
                }

                if (!buffer) continue;

                const type = await fileTypeFromBuffer(buffer);
                if (!type) continue;

                if (type.mime.startsWith('image/')) {
                    mediaObj.push({
                        image: buffer,
                        caption
                    });
                } else if (type.mime.startsWith('video/')) {
                    mediaObj.push({
                        video: buffer,
                        caption
                    });
                }
            } catch (e) {
                continue;
            }
        }

        if (mediaObj.length < 2) {
            throw new Error('Gagal memproses media, minimal butuh 2 media gambar/video yang valid.');
        }

        if (options.caption) {
            mediaObj[0].caption = options.caption;
            delete options.caption;
        }

        const delayTime = options.delay || 3000;
        delete options.delay;

        const album = generateWAMessageFromContent(
            jid, {
                albumMessage: {
                    expectedImageCount: mediaObj.filter((m) => m.image).length,
                    expectedVideoCount: mediaObj.filter((m) => m.video).length,
                    ...options,
                },
            }, {
                userJid: sock.user?.id,
                quoted: options.quoted,
                ...options,
            }
        );

        await sock.relayMessage(jid, album.message, {
            messageId: album.key.id
        });

        const delayMsg = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        for (const media of mediaObj) {
            const msg = await generateWAMessage(jid, media, {
                userJid: sock.user?.id,
                upload: sock.waUploadToServer,
                quoted: options.quoted,
                ...options,
            });

            msg.message.messageContextInfo = {
                messageAssociation: {
                    associationType: 1,
                    parentMessageKey: album.key,
                },
            };

            await sock.relayMessage(jid, msg.message, {
                messageId: msg.key.id
            });
            await delayMsg(delayTime);
        }

        return album;
    };

    sock.sendButton = async (jid, text, footer, buttons, quoted) => {
        return await sock.sendMessage(jid, {
            text,
            footer,
            buttons: buttons.map(btn => ({
                buttonId: btn.id,
                buttonText: {
                    displayText: btn.text
                },
                type: 1
            })),
            headerType: 1
        }, {
            quoted
        })
    }

    return sock;

};
