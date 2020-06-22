import axios from "axios";
import FormData from "form-data";

import { NowRequest, NowResponse } from "@vercel/node";

export default async (req: NowRequest, res: NowResponse) => {
  if (req.query.token != process.env.CRON_AUTH_TOKEN) {
    res.status(401).send("Not authorized :(");
  }

  let file = await axios.get(<string>req.query.file, {
    responseType: "stream",
  });

  let form = new FormData();
  form.append("token", process.env.SLACK_TOKEN);
  form.append("channels", <string>req.query.channel);
  form.append("initial_comment", <string>req.query.text);
  form.append("file", file.data);
  form.append("title", "image");

  await axios("https://slack.com/api/files.upload", {
    method: "POST",
    data: form,
    headers: {
      "Content-type": "multipart/form-data",
      ...form.getHeaders(),
    },
  });

  res.end();
};
