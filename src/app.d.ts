// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface Platform {}
    }
    interface Window {
        google: any;
    }

    interface Element {
        timeoutid?: number;
    }
    interface GoogleSignInPayload {
        credential: string;
        select_by: string;
    }

    interface ParamsObject {
        parent: string;
        mimeType: string;
        pageSize?: number;
        pageToken?: string;
    }

    interface ImgMeta {
        name?: string;
        mimeType?: string;
        description?: string;
        starred?: Boolean;
        parents?: [string];
        appProperties?: {
            origin?: string;
            src?: string;
        };
    }

    interface TokenResponse {
        access_token: string;
        authuser: string;
        expires_in: number;
        prompt: string;
        scope: string;
        token_type: string;
    }
    interface CreateResourceResponse {
        kind: string;
        id: string;
        name: string;
        mimeType: string;
    }

    interface PreviewItem {
        src: string;
        id: string;
        url?: string;
    }
    interface TouchCoords {
        startX?: number;
        startY?: number;
        endX?: number;
        endY?: number;
    }
    interface DropItem {
        name: string;
        id: string;
        mimeType: string;
        url?: string;
        imgRef: string;
        progress?: string;
        parent: string;
        parentName: string;
        file: DriveFile;
    }

    interface DropItems {
        [id: number]: DropItem;
    }

    interface DriveFile {
        id: string;
        name: string;
        description: string;
        starred: Boolean;
        thumbnailLink: string;
        parents?: string[];
        mimeType: string;
        size: string;
    }
    interface DriveFolder {
        id: string;
        name: string;
        parents: string[];
        starred: Boolean;
    }

    type FileResponse = DriveFile[] | DriveFolder[];

    interface GoogleDriveResponse<T> {
        files: T[];
        nextPageToken?: string;
    }

    interface PageData {
        folders: GoogleDriveResponse<DriveFolder>;
        files: GoogleDriveResponse<DriveFile>;
        activeFolder: DriveFolder;
    }

    type View = "FILE" | "FOLDER";

    type Mode = "" | "VIEW" | "EDIT" | "SEARCH" | "DELETE";

    type FolderAction = "EDIT" | "DELETE" | "MOVE" | "CREATE";
    interface FolderActionDetail {
        id: string;
        name: string;
    }

    interface Preferences {
        showFileNames: boolean;
        disableWebp: boolean;
        theme: "DARK" | "";
    }

    type Action =
        | "EDIT"
        | "DELETE"
        | "COPY"
        | "MOVE"
        | "TOP"
        | "DROP"
        | "IMG_PREVIEW"
        | "CLEAR_IMAGE_CACHE"
        | "IDB_RELOAD_REQUIRED"
        | "IMG_PREVIEW_FAILED"
        | "PROGRESS";

    interface WorkerMessage {
        context: Action;
        token?: string;
        activeParent?: parent;
        parent?: string;
        view?: "FILE" | "FOLDER";
        ids?: set<string>;
        success?: set<string>;
        dropItem?: DropItem;
        imgMeta?: ImgMeta;
        blob?: Blob;
        progressType?: Action;
        progress?: number;
        id?: string;
        status?: 1 | 0;
    }
}

export {};
