import { PhotoId, Photo, PlantFactId, TimelineEntryId } from "../types";
import { toPromise } from "./util";

class PhotoIdNotFoundError extends Error {
    readonly photoId: PhotoId;
    constructor(photoId: PhotoId) {
        super();
        this.photoId = photoId;
    }
}

export async function getPhoto(id: PhotoId, transaction: IDBTransaction): Promise<Photo> {
    const photo = await new Promise<Photo|null>((resolve, reject) => {
        const request = transaction.objectStore("photos").get(id);
        request.onsuccess = () => resolve(request.result as Photo|null);
        request.onerror = () => reject(request.error);
    });
    if (photo == null) {
        throw new PhotoIdNotFoundError(id);
    } else {
        return photo;
    }
}

export async function putPhoto(photo: Photo, transaction: IDBTransaction) {
    await toPromise(transaction.objectStore("photos").put(photo));
}

export async function putPhotos(photos: Photo[], transaction: IDBTransaction) {
    await Promise.all(photos.map(photo => putPhoto(photo, transaction)));
}

export async function getPhotosForPlantFact(factId: PlantFactId, transaction: IDBTransaction): Promise<Photo[]> {
    const photoStore = transaction.objectStore("photos");
    return await toPromise(photoStore.index("byPlantFactId").getAll(factId) as IDBRequest<Photo[]>);
}

export async function deletePhotosForPlantFact(factId: PlantFactId, transaction: IDBTransaction) {
    const photoStore = transaction.objectStore("photos");
    const photoIds = await toPromise(photoStore.index("byPlantFactId").getAllKeys(factId))
    await Promise.all(photoIds.map(photoId => toPromise(photoStore.delete(photoId))));
}

export async function getPhotosForTimelineEntry(timelineEntryId: TimelineEntryId, transaction: IDBTransaction): Promise<Photo[]> {
    const photoStore = transaction.objectStore("photos");
    return await toPromise(photoStore.index("byTimelineEntryId").getAll(timelineEntryId) as IDBRequest<Photo[]>);
}

export async function deletePhotosForTimelineEntry(timelineEntryId: TimelineEntryId, transaction: IDBTransaction) {
    const photoStore = transaction.objectStore("photos");
    const photoIds = await toPromise(photoStore.index("byTimelineEntryId").getAllKeys(timelineEntryId))
    await Promise.all(photoIds.map(photoId => toPromise(photoStore.delete(photoId))));
}