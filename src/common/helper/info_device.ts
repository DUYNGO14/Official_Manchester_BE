import { UAParser } from "ua-parser-js";


export function getDeviceInfo(userAgent: string) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: result.browser.name || 'Unknown',
    os: result.os.name || 'Unknown',
    device: result.device.type || 'desktop',
  };
}

export function stringifyDevice(info: { browser: string; os: string; device: string }) {
  return `${info.device}-${info.os}-${info.browser}`;
}
