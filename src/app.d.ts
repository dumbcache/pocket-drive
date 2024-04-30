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
    interface GoogleFile {
        id: string;
        name: string;
        description?: string;
        starred?: Boolean;
        parents?: string[];
        thumbnailLink?: string;
        appProperties?: {
            origin: string;
            src: string;
        };
        url?: string;
    }

    interface GoogleFileRes {
        files: GoogleFile[];
        nextPageToken?: string;
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
        file: File;
    }

    interface DropItems {
        [id: number]: DropItem;
    }

    interface File {
        id: string;
        name: string;
        description: string;
        starred: Boolean;
        thumbnailLink: string;
        parents?: string[];
        mimeType: string;
    }
    interface Folder {
        id: string;
        name: string;
        parents: string[];
        starred: Boolean;
    }

    type FileResponse = File[] | Folder[];

    interface GoogleFileResponse {
        files: FileResponse;
        nextPageToken?: string;
    }

    type FolderAction = "EDIT" | "DELETE" | "MOVE" | "CREATE";
    interface FolderActionDetail {
        id: string;
        name: string;
    }
}

export {};
