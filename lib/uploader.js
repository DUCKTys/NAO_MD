import axios from "axios";
import FormData from "form-data";

export const uguu = async (buffer) => {
  try {
    const form = new FormData();

    form.append(
      "files[]",
      buffer,
      `${Date.now()}.jpg`
    );

    const { data } = await axios.post(
      "https://uguu.se/upload",
      form,
      {
        headers: form.getHeaders()
      }
    );

    return data.files?.[0]?.url || null;
  } catch (e) {
    console.error("UGUU ERROR:", e);
    return null;
  }
};
