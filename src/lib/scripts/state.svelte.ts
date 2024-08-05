class AppStore<T> {
    nextPageToken = $state<string>();
    files = $state<T[]>([]);

    set(data: GoogleDriveResponse<T>) {
        // console.log(data);
        this.nextPageToken = data?.nextPageToken;
        this.files = data.files;
    }

    get() {
        return {
            nextPageToken: this.nextPageToken,
            files: this.files,
        };
    }
}
export const fsStore = new AppStore<DriveFile>();
export const fdStore = new AppStore<DriveFolder>();

class AppPreferences {
    showFileNames = $state(false);
    disableWebp = $state(false);
    theme = $state<"DARK" | "">("");

    toggleShowFileNames() {
        this.showFileNames = !this.showFileNames;
    }

    toggleWebp() {
        this.disableWebp = !this.disableWebp;
    }

    toggleTheme(theme: "DARK" | "") {
        this.theme = theme;
    }

    set({ showFileNames, disableWebp, theme }: Preferences) {
        this.showFileNames = showFileNames;
        this.disableWebp = disableWebp;
        this.theme = theme;
    }
}
export const preferences = new AppPreferences();

class AppStates {
    view = $state<"FILE" | "FOLDER">("FOLDER");
    mode = $state<Mode>("");
    starred = $state(false);
    profile = $state(false);
    refresh = $state(false);
    fetchall = $state(false);
    autosave = $state(false);
    progress = $state(false);
    shortcuts = $state(false);
    mask = $state(false);
    sessionTimeout = $state<Boolean>();
    sessionTimeoutId = $state<number>();
}
export const states = new AppStates();

class TempStore {
    activeFolder = $state<DriveFolder>();
    activeFile = $state<DriveFile>();
    dropItems = $state<DropItem[]>([]);
    folderAction = $state<FolderAction>({});
}
export const temp = new TempStore();
