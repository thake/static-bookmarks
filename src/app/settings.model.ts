export interface UserSettings {
  showTopUsedLinks: boolean;
  openInNewTab: boolean;
}

export const DEFAULT_USER_SETTINGS: Readonly<UserSettings> = {
  showTopUsedLinks: true,
  openInNewTab: true,
};
