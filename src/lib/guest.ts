// 游客模式（免登录快测）：基础信息与结果暂存 sessionStorage，登录后可认领保存
import type { Measurement, Profile } from "@/lib/domain";

const PROFILE_KEY = "bio_clock:guest-profile";
const RESULT_KEY = "bio_clock:guest-result";

export function saveGuestProfile(p: Profile) {
  sessionStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function readGuestProfile(): Profile | null {
  return read(PROFILE_KEY);
}

export function saveGuestResult(m: Measurement) {
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(m));
}

export function readGuestResult(): Measurement | null {
  return read(RESULT_KEY);
}

export function clearGuestData() {
  sessionStorage.removeItem(PROFILE_KEY);
  sessionStorage.removeItem(RESULT_KEY);
}

function read<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
