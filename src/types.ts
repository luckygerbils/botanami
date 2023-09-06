export interface RequestProps<G=undefined, S=undefined> {
    url: string,
    query: URLSearchParams,
    groups: G,
    state?: S,
}

export type PlantId = string;
export interface Plant {
    id: PlantId,
    commonNames: string[],
    scientificName: string,
    facts?: PlantFact[],
}
export type PlantRecord = Omit<Plant, "facts"> & {
    facts?: PlantFactId[],
};

export type PlantFactId = string;
export interface PlantFact {
    id: PlantFactId,
    photos?: Photo[],
    summary?: string,
    description?: string,
    source?: ExternalLink,
}
export type PlantFactRecord = Omit<PlantFact, "photos"> & {
    plantId: PlantId,
    photos?: PhotoId[],
};

export interface ExternalLink {
    website: string,
    url: string,
}

export interface Tag {
    tag: string,
    type: string,
}

export type PlantingId = string;
export interface Planting {
    id: PlantingId,
    name: string,
    plant: Plant,
    tags: Tag[],
    timeline?: TimelineEntry[],
}

export type PlantingRecord = Omit<Planting, "plant"|"timeline"> & {
    plant: PlantId,
    timeline?: TimelineEntryId[],
};

export type TimelineEntryId = string;
export interface TimelineEntry {
    id: TimelineEntryId,
    date: Date,
    summary?: string,
    description?: string,
    photos?: Photo[],
}

export type TimelineEntryRecord = Omit<TimelineEntry, "date"|"photos"> & {
    plantingId: PlantingId,
    date: string,
    photos?: PhotoId[],
}

export type PhotoId = string;
export type Photo = PlantFactPhoto | TimelineEntryPhoto;
interface BasePhoto {
    id: PhotoId,
    blob: Blob,
}
export interface PlantFactPhoto extends BasePhoto {
    plantFactId: PlantFactId,
}
export interface TimelineEntryPhoto extends BasePhoto {
    timelineEntryId: TimelineEntryId,
}

export interface Backup {
    id: string,
    date: Date,
}