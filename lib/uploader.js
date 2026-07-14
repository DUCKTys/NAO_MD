import axios from 'axios';

export const uguu = async (buffer) => {
  try {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('Input must be Buffer');
    }

    const form = new FormData();

    form.append(
      'files[]',
      new Blob([buffer]),
      `${Date.now()}.jpg`
    );

    const res = await axios.post(
      'https://uguu.se/upload',
      form
    );

    return res.data?.files?.[0]?.url || null;

  } catch (err) {
    return null;
  }
};
