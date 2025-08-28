import fetch from "node-fetch";
import robotsParser from "robots-parser";

export async function allowed(
  url: string,
  userAgent = "crawler-bot"
): Promise<boolean> {
  const u = new URL(url);
  const robotsUrl = `${u.protocol}//${u.host}/robots.txt`;
  try {
    const res = await fetch(robotsUrl);
    const txt = await res.text();
    const robots = robotsParser(robotsUrl, txt);
    return robots.isAllowed(url, userAgent) ?? true;
  } catch {
    return true;
  }
}
