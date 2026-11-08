export interface UserSettings {
  showTopUsedLinks: boolean;
}

export const DEFAULT_USER_SETTINGS: Readonly<UserSettings> = {
  showTopUsedLinks: true,
};
