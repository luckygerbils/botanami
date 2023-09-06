interface DriveListFilesResponse {
    "nextPageToken": string,
    "kind": string,
    "incompleteSearch": boolean,
    "files": DriveFile[],
}

interface DriveFile {
  "kind": string,
  "driveId": string,
  "fileExtension": string,
  "copyRequiresWriterPermission": boolean,
  "md5Checksum": string,
  "contentHints": {
    "indexableText": string,
    "thumbnail": {
      "image": string,
      "mimeType": string
    }
  },
  "writersCanShare": boolean,
  "viewedByMe": boolean,
  "mimeType": string,
  "exportLinks": Record<string, string>,
  "parents": [
    string
  ],
  "thumbnailLink": string,
  "iconLink": string,
  "shared": boolean,
  "lastModifyingUser": DriveUser,
  "owners": DriveUser[],
  "headRevisionId": string,
  "sharingUser": DriveUser,
  "webViewLink": string,
  "webContentLink": string,
  "size": string,
  "viewersCanCopyContent": boolean,
  // "permissions": [
  //   {
  //     object (Permission)
  //   }
  // ],
  "hasThumbnail": boolean,
  "spaces": [
    string
  ],
  "folderColorRgb": string,
  "id": string,
  "name": string,
  "description": string,
  "starred": boolean,
  "trashed": boolean,
  "explicitlyTrashed": boolean,
  "createdTime": string,
  "modifiedTime": string,
  "modifiedByMeTime": string,
  "viewedByMeTime": string,
  "sharedWithMeTime": string,
  "quotaBytesUsed": string,
  "version": string,
  "originalFilename": string,
  "ownedByMe": boolean,
  "fullFileExtension": string,
  "properties": Record<string, string>,
  "appProperties": Record<string, string>,
  "isAppAuthorized": boolean,
  "teamDriveId": string,
  "capabilities": {
    "canChangeViewersCanCopyContent": boolean,
    "canMoveChildrenOutOfDrive": boolean,
    "canReadDrive": boolean,
    "canEdit": boolean,
    "canCopy": boolean,
    "canComment": boolean,
    "canAddChildren": boolean,
    "canDelete": boolean,
    "canDownload": boolean,
    "canListChildren": boolean,
    "canRemoveChildren": boolean,
    "canRename": boolean,
    "canTrash": boolean,
    "canReadRevisions": boolean,
    "canReadTeamDrive": boolean,
    "canMoveTeamDriveItem": boolean,
    "canChangeCopyRequiresWriterPermission": boolean,
    "canMoveItemIntoTeamDrive": boolean,
    "canUntrash": boolean,
    "canModifyContent": boolean,
    "canMoveItemWithinTeamDrive": boolean,
    "canMoveItemOutOfTeamDrive": boolean,
    "canDeleteChildren": boolean,
    "canMoveChildrenOutOfTeamDrive": boolean,
    "canMoveChildrenWithinTeamDrive": boolean,
    "canTrashChildren": boolean,
    "canMoveItemOutOfDrive": boolean,
    "canAddMyDriveParent": boolean,
    "canRemoveMyDriveParent": boolean,
    "canMoveItemWithinDrive": boolean,
    "canShare": boolean,
    "canMoveChildrenWithinDrive": boolean,
    "canModifyContentRestriction": boolean,
    "canAddFolderFromAnotherDrive": boolean,
    "canChangeSecurityUpdateEnabled": boolean,
    "canAcceptOwnership": boolean,
    "canReadLabels": boolean,
    "canModifyLabels": boolean,
    "canModifyEditorContentRestriction": boolean,
    "canModifyOwnerContentRestriction": boolean,
    "canRemoveContentRestriction": boolean
  },
  "hasAugmentedPermissions": boolean,
  "trashingUser": DriveUser,
  "thumbnailVersion": string,
  "trashedTime": string,
  "modifiedByMe": boolean,
  "permissionIds": [
    string
  ],
  "imageMediaMetadata": {
    "flashUsed": boolean,
    "meteringMode": string,
    "sensor": string,
    "exposureMode": string,
    "colorSpace": string,
    "whiteBalance": string,
    "width": number,
    "height": number,
    "location": {
      "latitude": number,
      "longitude": number,
      "altitude": number
    },
    "rotation": number,
    "time": string,
    "cameraMake": string,
    "cameraModel": string,
    "exposureTime": number,
    "aperture": number,
    "focalLength": number,
    "isoSpeed": number,
    "exposureBias": number,
    "maxApertureValue": number,
    "subjectDistance": number,
    "lens": string
  },
  "videoMediaMetadata": {
    "width": number,
    "height": number,
    "durationMillis": string
  },
  "shortcutDetails": {
    "targetId": string,
    "targetMimeType": string,
    "targetResourceKey": string
  },
  // "contentRestrictions": [
  //   {
  //     object (ContentRestriction)
  //   }
  // ],
  "resourceKey": string,
  "linkShareMetadata": {
    "securityUpdateEligible": boolean,
    "securityUpdateEnabled": boolean
  },
  "labelInfo": {
    "labels": DriveLabel[],
  },
  "sha1Checksum": string,
  "sha256Checksum": string
}

interface DriveUser {
  "displayName": string,
  "kind": string,
  "me": boolean,
  "permissionId": string,
  "emailAddress": string,
  "photoLink": string
}

interface DriveLabel {
  "id": string,
  "revisionId": string,
  "kind": string,
  "fields": Record<string, DriveField>
}

interface DriveField {
  "kind": string,
  "id": string,
  "valueType": string,
  "dateString": string[],
  "integer": string[],
  "selection": string[],
  "text": string[],
  "user": DriveUser[],
}