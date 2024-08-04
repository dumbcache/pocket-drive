export class AppStore<T> {
    nextPageToken = $state<string>();
    files = $state<T[]>([]);

    set(data: GoogleDriveResponse<T>) {
        console.log(data);
        this.nextPageToken = data?.nextPageToken;
        this.files = data.files;
    }
}
export const fsStore = new AppStore<DriveFile>();
export const fdStore = new AppStore<DriveFolder>();

export class AppPreferences {
    showFileNames = $state(false);
    disableWebp = $state(false);
    theme = $state<"dark" | "">("");

    toggleShowFileNames() {
        this.showFileNames = !this.showFileNames;
    }

    toggleWebp() {
        this.disableWebp = !this.disableWebp;
    }

    toggleTheme(theme: "dark" | "") {
        this.theme = theme;
    }

    set({ showFileNames, disableWebp, theme }) {
        this.showFileNames = showFileNames;
        this.disableWebp = disableWebp;
        this.theme = theme;
    }
}
export const appPreferences = new AppPreferences();

export class AppStates {
    view = $state<"FILE" | "FOLDER">("FOLDER");
    mode = $state("");
    starred = $state(false);
    profile = $state(false);
    refresh = $state(false);
    autosave = $state(false);
    progress = $state(false);
    shortcuts = $state(false);
    mask = $state(false);
    sessionTimeout = $state<Boolean>();
    sessionTimeoutId = $state<number>();
}

export const appStates = new AppStates();
